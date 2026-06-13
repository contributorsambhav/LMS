import axios from "axios";

/**
 * Zoom Server-to-Server OAuth Service
 *
 * Uses Zoom's Server-to-Server OAuth flow to obtain access tokens
 * and create scheduled meetings programmatically. Tokens are cached
 * in-memory with a TTL buffer to avoid redundant requests.
 *
 * Required Environment Variables:
 *   ZOOM_ACCOUNT_ID   — Your Zoom account ID
 *   ZOOM_CLIENT_ID    — OAuth app client ID
 *   ZOOM_CLIENT_SECRET — OAuth app client secret
 *
 * See: https://developers.zoom.us/docs/internal-apps/s2s-oauth/
 */

// ── Token Cache ──────────────────────────────────────────────────────
interface TokenCache {
  token: string;
  expiresAt: number;
}
const tokenCacheMap = new Map<string, TokenCache>();

/**
 * Obtains a Zoom Server-to-Server OAuth access token using dynamic credentials.
 * Caches the token in-memory by clientId and refreshes 60 seconds before expiry.
 */
const getZoomAccessToken = async (
  accountId: string,
  clientId: string,
  clientSecret: string
): Promise<string> => {
  const now = Date.now();
  const cached = tokenCacheMap.get(clientId);

  if (cached && cached.expiresAt - now > 60_000) {
    return cached.token;
  }

  const credentialsStr = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await axios.post(
    "https://zoom.us/oauth/token",
    null,
    {
      params: {
        grant_type: "account_credentials",
        account_id: accountId,
      },
      headers: {
        Authorization: `Basic ${credentialsStr}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  const token = response.data.access_token;
  const expiresAt = now + response.data.expires_in * 1000;

  tokenCacheMap.set(clientId, { token, expiresAt });

  return token;
};

// ── Public API ───────────────────────────────────────────────────────

export interface ZoomMeetingResult {
  meetingId: number;
  joinUrl: string;
  startUrl: string;
  password: string;
  topic: string;
}

/**
 * Creates a scheduled Zoom meeting via the Zoom REST API.
 *
 * @param topic     - Meeting title (displayed in the Zoom client)
 * @param startTime - ISO-8601 start time string
 * @param duration  - Duration in minutes
 * @param credentials - Dynamic Zoom Server-to-Server credentials
 * @returns         - Meeting metadata including join URL and password
 */
export const createZoomMeeting = async (
  topic: string,
  startTime: string,
  duration: number,
  credentials: { zoomAccountId: string; zoomClientId: string; zoomClientSecret: string }
): Promise<ZoomMeetingResult> => {
  const token = await getZoomAccessToken(
    credentials.zoomAccountId,
    credentials.zoomClientId,
    credentials.zoomClientSecret
  );

  const response = await axios.post(
    "https://api.zoom.us/v2/users/me/meetings",
    {
      topic,
      type: 2, // Scheduled meeting
      start_time: startTime,
      duration,
      timezone: "UTC",
      settings: {
        join_before_host: true,
        waiting_room: false,
        auto_recording: "cloud", // Auto-record to Zoom Cloud
        mute_upon_entry: true,
        approval_type: 0, // Automatically approve
        registration_type: 1, // Attendees register once
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const meeting = response.data;

  return {
    meetingId: meeting.id,
    joinUrl: meeting.join_url,
    startUrl: meeting.start_url,
    password: meeting.password || "",
    topic: meeting.topic,
  };
};

/**
 * Deletes a previously created Zoom meeting.
 *
 * @param meetingId   - The Zoom meeting ID to delete
 * @param credentials - Dynamic Zoom Server-to-Server credentials
 */
export const deleteZoomMeeting = async (
  meetingId: number,
  credentials: { zoomAccountId: string; zoomClientId: string; zoomClientSecret: string }
): Promise<void> => {
  const token = await getZoomAccessToken(
    credentials.zoomAccountId,
    credentials.zoomClientId,
    credentials.zoomClientSecret
  );

  await axios.delete(
    `https://api.zoom.us/v2/meetings/${meetingId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

/**
 * Checks whether Zoom credentials are configured.
 */
export const isZoomConfigured = (credentials?: { zoomAccountId?: string; zoomClientId?: string; zoomClientSecret?: string }): boolean => {
  return !!(
    credentials?.zoomAccountId &&
    credentials?.zoomClientId &&
    credentials?.zoomClientSecret
  );
};

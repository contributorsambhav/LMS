import React from 'react';
import { FileText, Plus, ExternalLink, Trash2, Eye } from 'lucide-react';
import { API_BASE_URL } from '../../../../../lib/api';

interface MaterialsTabProps {
  materials: any[];
  isAdmin: boolean;
  isFaculty: boolean;
  setShowAddMaterialModal: (show: boolean) => void;
  handleDeleteMaterial: (id: string) => void;
}

export default function MaterialsTab({
  materials,
  isAdmin,
  isFaculty,
  setShowAddMaterialModal,
  handleDeleteMaterial
}: MaterialsTabProps) {
  return (
    <div className="space-y-6">
      
      {/* Header + Add button */}
      <div className="flex justify-between items-center gap-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">Reference Catalog</h3>
          <p className="text-xs text-muted-foreground">Access reference documents, lecture notes, and uploads.</p>
        </div>
        {(isAdmin || isFaculty) && (
          <button 
            onClick={() => setShowAddMaterialModal(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Upload Material
          </button>
        )}
      </div>

      {/* Materials List */}
      {materials.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <h4 className="text-xs font-semibold text-foreground mb-1">No Materials Uploaded</h4>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            {isAdmin || isFaculty 
              ? "Upload standalone references, syllabus files, and lecture notes for enrolled students." 
              : "No reference materials have been uploaded by teachers yet."}
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-secondary/15 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">
                  <th className="p-4">Name / Reference Document</th>
                  <th className="p-4">Session Context</th>
                  <th className="p-4">Uploaded At</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {materials.map((mat) => (
                  <tr key={mat._id} className="hover:bg-secondary/10 transition-colors">
                    <td className="p-4 font-semibold text-foreground">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-red-500 shrink-0" />
                        <span>{mat.title || mat.originalName}</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {mat.sessionId ? (
                        <span className="text-primary font-medium">{mat.sessionId.title}</span>
                      ) : (
                        <span className="text-muted-foreground italic">General Reference</span>
                      )}
                    </td>
                    <td className="p-4 text-muted-foreground font-mono">
                      {new Date(mat.uploadedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            const url = mat.filePath.startsWith('http') ? mat.filePath : `${API_BASE_URL}${mat.filePath}`;
                            
                            // Check if it's a PDF. If it's a PDF, use the secure viewer route.
                            if (url.toLowerCase().endsWith('.pdf')) {
                              window.open(`/pdf-viewer?url=${encodeURIComponent(url)}&title=${encodeURIComponent(mat.title || mat.originalName || 'Document')}`, '_blank');
                            } else {
                              window.open(url, '_blank', 'noopener,noreferrer');
                            }
                          }}
                          onContextMenu={(e) => e.preventDefault()}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
                        >
                          View PDF <Eye className="h-3 w-3" />
                        </button>
                        {(isAdmin || isFaculty) && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              handleDeleteMaterial(mat._id);
                            }}
                            className="p-1 rounded text-destructive hover:bg-destructive/15 transition-colors cursor-pointer"
                            title="Delete Material"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

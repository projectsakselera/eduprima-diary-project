import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertTriangle, User, Mail, Hash, Shield, Database } from "lucide-react";

interface TutorInfo {
  id: string;
  namaLengkap: string;
  email: string;
  trn: string;
  status_tutor: string;
}

interface CascadePreview {
  table_name: string;
  records_affected: number;
  data_type: string;
}

interface TutorDeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  tutor: TutorInfo | null;
  isLoading: boolean;
  cascadePreview: CascadePreview[] | null;
  previewError?: string | null;
}

const TutorDeleteConfirmationDialog: React.FC<TutorDeleteConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  tutor,
  isLoading,
  cascadePreview,
  previewError
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!tutor) return;
    
    try {
      setIsDeleting(true);
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'pending':
        return 'outline';
      case 'suspended':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getTotalRecords = () => {
    if (!cascadePreview) return 0;
    return cascadePreview.reduce((total, item) => total + item.records_affected, 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-red-600">
            <AlertTriangle className="h-6 w-6" />
            Konfirmasi Hapus Tutor
          </DialogTitle>
          <DialogDescription className="text-base">
            Tindakan ini akan menghapus semua data tutor secara permanen dan tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>

        {tutor && (
          <div className="space-y-6">
            {/* Tutor Information Card */}
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informasi Tutor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500">Nama Lengkap</div>
                      <div className="font-semibold">{tutor.namaLengkap}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500">Email</div>
                      <div className="font-mono text-sm">{tutor.email}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500">TRN</div>
                      <div className="font-mono text-sm">{tutor.trn}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500">Status</div>
                      <Badge variant={getStatusBadgeVariant(tutor.status_tutor)}>
                        {tutor.status_tutor}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CASCADE Preview */}
            <Card className="border-orange-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Data yang akan terhapus (CASCADE)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span className="text-gray-600">Menganalisis data yang akan terhapus...</span>
                  </div>
                ) : previewError ? (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Error menganalisis data: {previewError}
                    </AlertDescription>
                  </Alert>
                ) : cascadePreview && cascadePreview.length > 0 ? (
                  <div className="space-y-4">
                    <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                      <div className="text-sm font-medium text-orange-800">
                        Total: {getTotalRecords()} record(s) akan dihapus dari {cascadePreview.length} tabel
                      </div>
                    </div>
                    
                    <div className="grid gap-2 max-h-64 overflow-y-auto">
                      {cascadePreview.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                          <div>
                            <div className="font-medium text-sm">
                              {item.table_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {item.data_type}
                            </div>
                          </div>
                          <Badge variant="outline" className="font-mono">
                            {item.records_affected} record(s)
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    Tidak ada data yang akan terhapus
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Warning Alert */}
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Peringatan:</strong> Tindakan ini akan menghapus semua data tutor secara permanen termasuk:
                profil, alamat, detail pendidik, konfigurasi jadwal, preferensi mengajar, mapping program, 
                dan semua data terkait lainnya. Data yang sudah dihapus tidak dapat dikembalikan.
              </AlertDescription>
            </Alert>
          </div>
        )}

        <DialogFooter className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1"
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting || isLoading || !tutor}
            className="flex-1"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Menghapus...
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Ya, Hapus Tutor
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TutorDeleteConfirmationDialog;
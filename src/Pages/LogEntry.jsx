import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import LogTypeSelector from '@/components/log/LogTypeSelector';
import LogForm from '@/components/log/LogForm';

export default function LogEntry() {
  const [selectedType, setSelectedType] = useState(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const createLog = useMutation({
    mutationFn: (data) => base44.entities.HealthLog.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['healthLogs'] });
      toast.success('Wpis zapisany!');
      navigate('/');
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Nowy wpis</h1>
        <p className="text-muted-foreground text-sm mt-1">Zapisz swoje dane zdrowotne</p>
      </div>

      <LogTypeSelector selected={selectedType} onSelect={setSelectedType} />

      {selectedType && (
        <LogForm
          type={selectedType}
          onSave={(data) => createLog.mutate(data)}
          saving={createLog.isPending}
        />
      )}
    </div>
  );
}
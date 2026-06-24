import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Phone, UserPlus, Trash2, Shield, Eye, Bell } from 'lucide-react';
import { toast } from 'sonner';

export default function Emergency() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '', relationship: '', phone: '', email: '',
    can_view_data: false, notify_on_crisis: true,
  });
  const queryClient = useQueryClient();

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['emergencyContacts'],
    queryFn: () => base44.entities.EmergencyContact.list(),
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => base44.entities.DoctorAppointment.list('-date', 10),
  });

  const createContact = useMutation({
    mutationFn: (data) => base44.entities.EmergencyContact.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergencyContacts'] });
      setDialogOpen(false);
      setNewContact({ name: '', relationship: '', phone: '', email: '', can_view_data: false, notify_on_crisis: true });
      toast.success('Contact added');
    },
  });

  const deleteContact = useMutation({
    mutationFn: (id) => base44.entities.EmergencyContact.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergencyContacts'] });
      toast.success('Contact removed');
    },
  });

  const [apptDialog, setApptDialog] = useState(false);
  const [newAppt, setNewAppt] = useState({ doctor_name: '', specialty: '', date: '', location: '', notes: '' });

  const createAppt = useMutation({
    mutationFn: (data) => base44.entities.DoctorAppointment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setApptDialog(false);
      setNewAppt({ doctor_name: '', specialty: '', date: '', location: '', notes: '' });
      toast.success('Appointment added');
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Emergency & Contacts</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage emergency contacts and doctor appointments</p>
      </div>

      {/* Emergency Contacts */}
      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Shield className="w-5 h-5 text-destructive" />
            Emergency Contacts
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2"><UserPlus className="w-4 h-4" /> Add</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Emergency Contact</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={newContact.name} onChange={e => setNewContact(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Relationship</Label>
                  <Input placeholder="e.g., Parent, Partner, Friend" value={newContact.relationship} onChange={e => setNewContact(p => ({ ...p, relationship: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input type="tel" value={newContact.phone} onChange={e => setNewContact(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Email (optional)</Label>
                  <Input type="email" value={newContact.email} onChange={e => setNewContact(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Can view health data</Label>
                  <Switch checked={newContact.can_view_data} onCheckedChange={v => setNewContact(p => ({ ...p, can_view_data: v }))} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Notify on crisis</Label>
                  <Switch checked={newContact.notify_on_crisis} onCheckedChange={v => setNewContact(p => ({ ...p, notify_on_crisis: v }))} />
                </div>
                <Button onClick={() => createContact.mutate(newContact)} disabled={!newContact.name || !newContact.phone} className="w-full">
                  Add Contact
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {contacts.length === 0 ? (
            <p className="text-center text-muted-foreground py-6 text-sm">No emergency contacts added yet.</p>
          ) : (
            <div className="space-y-3">
              {contacts.map((contact) => (
                <div key={contact.id} className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 group">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {contact.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{contact.name}</p>
                    <p className="text-xs text-muted-foreground">{contact.relationship} · {contact.phone}</p>
                    <div className="flex gap-2 mt-1">
                      {contact.can_view_data && (
                        <span className="flex items-center gap-1 text-xs text-primary"><Eye className="w-3 h-3" /> Can view data</span>
                      )}
                      {contact.notify_on_crisis && (
                        <span className="flex items-center gap-1 text-xs text-accent"><Bell className="w-3 h-3" /> Crisis alerts</span>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteContact.mutate(contact.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Doctor Appointments */}
      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Phone className="w-5 h-5 text-primary" />
            Doctor Appointments
          </CardTitle>
          <Dialog open={apptDialog} onOpenChange={setApptDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> Add</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Appointment</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Doctor Name</Label>
                  <Input value={newAppt.doctor_name} onChange={e => setNewAppt(p => ({ ...p, doctor_name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Specialty</Label>
                  <Input placeholder="e.g., Endocrinologist" value={newAppt.specialty} onChange={e => setNewAppt(p => ({ ...p, specialty: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Date & Time</Label>
                  <Input type="datetime-local" value={newAppt.date} onChange={e => setNewAppt(p => ({ ...p, date: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input value={newAppt.location} onChange={e => setNewAppt(p => ({ ...p, location: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Notes / Questions</Label>
                  <Input placeholder="Questions to ask..." value={newAppt.notes} onChange={e => setNewAppt(p => ({ ...p, notes: e.target.value }))} />
                </div>
                <Button onClick={() => createAppt.mutate(newAppt)} disabled={!newAppt.doctor_name || !newAppt.date} className="w-full">
                  Add Appointment
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <p className="text-center text-muted-foreground py-6 text-sm">No appointments scheduled.</p>
          ) : (
            <div className="space-y-3">
              {appointments.map((appt) => (
                <div key={appt.id} className="p-4 rounded-xl bg-muted/30">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{appt.doctor_name}</p>
                      <p className="text-xs text-muted-foreground">{appt.specialty}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {appt.date ? new Date(appt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  {appt.location && <p className="text-xs text-muted-foreground mt-1">📍 {appt.location}</p>}
                  {appt.notes && <p className="text-xs mt-1">{appt.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
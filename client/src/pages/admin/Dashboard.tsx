import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Link as LinkIcon, 
  Megaphone, 
  Trash2, 
  Plus, 
  Eye, 
  LogOut,
  Copy
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GlassCard } from "@/components/ui/glass-card";
import { useAdminLinks, useCreateLink, useDeleteLink, useAdminAds, useCreateAd, useDeleteAd } from "@/hooks/use-admin";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (sessionStorage.getItem("admin_auth") !== "true") {
      setLocation("/admin");
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth");
    setLocation("/admin");
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <LayoutDashboard className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-display font-bold text-white">Admin Dashboard</h1>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-muted-foreground hover:text-white">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </header>

        <Tabs defaultValue="links" className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10 p-1">
            <TabsTrigger value="links" className="data-[state=active]:bg-primary">
              <LinkIcon className="w-4 h-4 mr-2" /> Links
            </TabsTrigger>
            <TabsTrigger value="ads" className="data-[state=active]:bg-primary">
              <Megaphone className="w-4 h-4 mr-2" /> Ads
            </TabsTrigger>
          </TabsList>

          <TabsContent value="links">
            <LinksManager />
          </TabsContent>

          <TabsContent value="ads">
            <AdsManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function LinksManager() {
  const { data: links, isLoading } = useAdminLinks();
  const createLink = useCreateLink();
  const deleteLink = useDeleteLink();
  const { toast } = useToast();
  const [newLink, setNewLink] = useState({ id: "", title: "", originalUrl: "" });
  const [isOpen, setIsOpen] = useState(false);

  const handleCreate = async () => {
    try {
      await createLink.mutateAsync(newLink);
      setIsOpen(false);
      setNewLink({ id: "", title: "", originalUrl: "" });
      toast({ title: "Success", description: "Link created successfully" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const copyToClipboard = (id: string) => {
    const url = `${window.location.origin}/link/${id}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Copied", description: "Link copied to clipboard" });
  };

  if (isLoading) return <div className="text-center p-8">Loading links...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" /> Create Link
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#09090b] border-white/10">
            <DialogHeader>
              <DialogTitle>Create Secure Link</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>ID (Slug)</Label>
                <Input 
                  value={newLink.id}
                  onChange={e => setNewLink({...newLink, id: e.target.value})}
                  placeholder="e.g. vacation-photos (optional)"
                />
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input 
                  value={newLink.title}
                  onChange={e => setNewLink({...newLink, title: e.target.value})}
                  placeholder="My Secure File"
                />
              </div>
              <div className="space-y-2">
                <Label>Destination URL</Label>
                <Input 
                  value={newLink.originalUrl}
                  onChange={e => setNewLink({...newLink, originalUrl: e.target.value})}
                  placeholder="https://drive.google.com/..."
                />
              </div>
              <Button 
                onClick={handleCreate} 
                disabled={createLink.isPending}
                className="w-full bg-primary"
              >
                {createLink.isPending ? "Creating..." : "Create Link"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <GlassCard className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-white/5">
              <TableHead className="text-white">ID</TableHead>
              <TableHead className="text-white">Title</TableHead>
              <TableHead className="text-white">Destination</TableHead>
              <TableHead className="text-white">Views</TableHead>
              <TableHead className="text-right text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {links?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No links created yet.
                </TableCell>
              </TableRow>
            )}
            {links?.map((link) => (
              <TableRow key={link.id} className="border-white/10 hover:bg-white/5">
                <TableCell className="font-mono text-primary">{link.id}</TableCell>
                <TableCell>{link.title}</TableCell>
                <TableCell className="max-w-[200px] truncate text-muted-foreground">
                  {link.originalUrl}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 opacity-50" /> {link.views}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => copyToClipboard(link.id)}>
                    <Copy className="w-4 h-4 text-blue-400" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => deleteLink.mutate(link.id)}
                    className="hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </GlassCard>
    </div>
  );
}

function AdsManager() {
  const { data: ads, isLoading } = useAdminAds();
  const createAd = useCreateAd();
  const deleteAd = useDeleteAd();
  const { toast } = useToast();
  const [newAd, setNewAd] = useState({ placement: "", code: "" });
  const [isOpen, setIsOpen] = useState(false);

  const handleCreate = async () => {
    try {
      await createAd.mutateAsync(newAd);
      setIsOpen(false);
      setNewAd({ placement: "", code: "" });
      toast({ title: "Success", description: "Ad created successfully" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const placements = ["landing_top", "landing_bottom", "step2_top", "step2_mid", "step3_top", "step3_mid", "step3_bottom", "download_top", "download_bottom"];

  if (isLoading) return <div className="text-center p-8">Loading ads...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" /> Add Placement
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#09090b] border-white/10">
            <DialogHeader>
              <DialogTitle>Add Advertisement</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Placement</Label>
                <select 
                  className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-sm"
                  value={newAd.placement}
                  onChange={e => setNewAd({...newAd, placement: e.target.value})}
                >
                  <option value="">Select Placement</option>
                  {placements.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Ad Code (HTML/JS)</Label>
                <Textarea 
                  value={newAd.code}
                  onChange={e => setNewAd({...newAd, code: e.target.value})}
                  placeholder="<script>...</script>"
                  className="font-mono text-xs min-h-[150px]"
                />
              </div>
              <Button 
                onClick={handleCreate} 
                disabled={createAd.isPending}
                className="w-full bg-primary"
              >
                {createAd.isPending ? "Saving..." : "Save Ad"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <GlassCard className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-white/5">
              <TableHead className="text-white">Placement</TableHead>
              <TableHead className="text-white">Code Preview</TableHead>
              <TableHead className="text-right text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ads?.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  No ads configured.
                </TableCell>
              </TableRow>
            )}
            {ads?.map((ad) => (
              <TableRow key={ad.id} className="border-white/10 hover:bg-white/5">
                <TableCell className="font-mono text-primary">{ad.placement}</TableCell>
                <TableCell className="max-w-[300px] truncate text-muted-foreground font-mono text-xs">
                  {ad.code}
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => deleteAd.mutate(ad.id)}
                    className="hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </GlassCard>
    </div>
  );
}

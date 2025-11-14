'use client';

import { useQuery, useMutation } from '@apollo/client';
import {
  GET_MCP_SERVERS,
  GET_MCP_TOOLS,
  CREATE_MCP_SERVER,
  UPDATE_MCP_SERVER,
  DELETE_MCP_SERVER,
  CONNECT_MCP_SERVER,
  EXECUTE_MCP_TOOL,
} from '@/graphql/mcp';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Plug,
  Plus,
  Trash2,
  RefreshCw,
  Play,
  Check,
  X,
  Wrench,
  Zap,
  Circle,
} from 'lucide-react';

export default function MCPPage() {
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [executeDialogOpen, setExecuteDialogOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<any>(null);
  const [toolParameters, setToolParameters] = useState<Record<string, any>>({});

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'http',
    url: '',
  });

  const { data: serversData, loading: serversLoading, refetch: refetchServers } = useQuery(GET_MCP_SERVERS);
  const { data: toolsData, loading: toolsLoading, refetch: refetchTools } = useQuery(GET_MCP_TOOLS);

  const [createServer] = useMutation(CREATE_MCP_SERVER, {
    onCompleted: () => {
      toast({ title: 'MCP Server created' });
      setCreateDialogOpen(false);
      setFormData({ name: '', description: '', type: 'http', url: '' });
      refetchServers();
      refetchTools();
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const [updateServer] = useMutation(UPDATE_MCP_SERVER, {
    onCompleted: () => {
      refetchServers();
      refetchTools();
    },
  });

  const [deleteServer] = useMutation(DELETE_MCP_SERVER, {
    onCompleted: () => {
      toast({ title: 'Server deleted' });
      refetchServers();
      refetchTools();
    },
  });

  const [connectServer] = useMutation(CONNECT_MCP_SERVER, {
    onCompleted: () => {
      toast({ title: 'Server connected' });
      refetchServers();
      refetchTools();
    },
    onError: (error) => {
      toast({ title: 'Connection failed', description: error.message, variant: 'destructive' });
    },
  });

  const [executeTool] = useMutation(EXECUTE_MCP_TOOL, {
    onCompleted: (data) => {
      toast({ title: 'Tool executed successfully' });
      console.log('Tool result:', data.executeMCPTool);
      setExecuteDialogOpen(false);
      setSelectedTool(null);
      setToolParameters({});
      refetchTools();
    },
    onError: (error) => {
      toast({ title: 'Execution failed', description: error.message, variant: 'destructive' });
    },
  });

  const handleCreateServer = async () => {
    if (!formData.name || !formData.url) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    await createServer({
      variables: {
        input: {
          name: formData.name,
          description: formData.description,
          type: formData.type,
          url: formData.url,
        },
      },
    });
  };

  const handleToggleServer = async (server: any) => {
    await updateServer({
      variables: {
        input: {
          id: server.id,
          isEnabled: !server.isEnabled,
        },
      },
    });
  };

  const handleConnectServer = async (serverId: string) => {
    await connectServer({ variables: { id: serverId } });
  };

  const handleDeleteServer = async (serverId: string) => {
    if (confirm('Are you sure you want to delete this server?')) {
      await deleteServer({ variables: { id: serverId } });
    }
  };

  const handleExecuteTool = (tool: any) => {
    setSelectedTool(tool);
    setToolParameters({});
    setExecuteDialogOpen(true);
  };

  const handleRunTool = async () => {
    if (!selectedTool) return;

    await executeTool({
      variables: {
        input: {
          toolId: selectedTool.id,
          parameters: toolParameters,
        },
      },
    });
  };

  const servers = serversData?.mcpServers || [];
  const tools = toolsData?.mcpTools || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'disconnected':
        return <Circle className="h-4 w-4 text-gray-400" />;
      case 'error':
        return <X className="h-4 w-4 text-red-600" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">MCP Integration</h1>
        <p className="text-muted-foreground">
          Model Context Protocol - Extend AI with custom tools and capabilities
        </p>
      </div>

      <Tabs defaultValue="servers" className="w-full">
        <TabsList>
          <TabsTrigger value="servers">
            <Plug className="mr-2 h-4 w-4" />
            Servers ({servers.length})
          </TabsTrigger>
          <TabsTrigger value="tools">
            <Wrench className="mr-2 h-4 w-4" />
            Tools ({tools.length})
          </TabsTrigger>
        </TabsList>

        {/* Servers Tab */}
        <TabsContent value="servers" className="mt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">MCP Servers</h2>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Server
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {servers.map((server: any) => (
              <Card key={server.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2 flex-1">
                      {getStatusIcon(server.status)}
                      <CardTitle className="text-lg">{server.name}</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteServer(server.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {server.description && <CardDescription>{server.description}</CardDescription>}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Type:</span>
                      <Badge variant="outline">{server.type}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tools:</span>
                      <span className="font-medium">{server.tools?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge
                        variant={
                          server.status === 'connected'
                            ? 'default'
                            : server.status === 'error'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {server.status}
                      </Badge>
                    </div>
                    {server.lastError && (
                      <div className="text-xs text-red-600 mt-2">{server.lastError}</div>
                    )}
                    <div className="flex space-x-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleConnectServer(server.id)}
                        className="flex-1"
                      >
                        <RefreshCw className="mr-2 h-3 w-3" />
                        Connect
                      </Button>
                      <Button
                        size="sm"
                        variant={server.isEnabled ? 'default' : 'secondary'}
                        onClick={() => handleToggleServer(server)}
                        className="flex-1"
                      >
                        {server.isEnabled ? 'Enabled' : 'Disabled'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {servers.length === 0 && !serversLoading && (
            <div className="text-center py-12 text-muted-foreground">
              No MCP servers configured. Add your first server to get started!
            </div>
          )}
        </TabsContent>

        {/* Tools Tab */}
        <TabsContent value="tools" className="mt-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">Available Tools</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Execute tools from connected MCP servers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool: any) => (
              <Card key={tool.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-5 w-5 text-orange-600" />
                      <CardTitle className="text-lg">{tool.name}</CardTitle>
                    </div>
                    {tool.isEnabled && (
                      <Badge variant="secondary" className="text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {tool.tags && tool.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {tool.tags.map((tag: string) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm pt-2">
                      <span className="text-muted-foreground">Server:</span>
                      <span className="text-xs">{tool.server?.name}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Used:</span>
                      <span>{tool.usageCount} times</span>
                    </div>
                    <Button
                      className="w-full mt-4"
                      onClick={() => handleExecuteTool(tool)}
                      disabled={!tool.isEnabled || tool.server?.status !== 'connected'}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Execute
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {tools.length === 0 && !toolsLoading && (
            <div className="text-center py-12 text-muted-foreground">
              No tools available. Connect an MCP server to discover tools!
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Server Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add MCP Server</DialogTitle>
            <DialogDescription>
              Configure a new Model Context Protocol server
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="My MCP Server"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Server description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="http">HTTP</SelectItem>
                  <SelectItem value="websocket">WebSocket</SelectItem>
                  <SelectItem value="stdio">STDIO</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="url">URL *</Label>
              <Input
                id="url"
                placeholder="https://api.example.com/mcp"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateServer}>Add Server</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Execute Tool Dialog */}
      <Dialog open={executeDialogOpen} onOpenChange={setExecuteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Execute Tool: {selectedTool?.name}</DialogTitle>
            <DialogDescription>{selectedTool?.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedTool?.schema?.properties &&
              Object.entries(selectedTool.schema.properties).map(([key, prop]: [string, any]) => (
                <div key={key}>
                  <Label htmlFor={key}>
                    {key}
                    {selectedTool.schema.required?.includes(key) && ' *'}
                  </Label>
                  <Input
                    id={key}
                    placeholder={prop.description || key}
                    value={toolParameters[key] || ''}
                    onChange={(e) =>
                      setToolParameters({ ...toolParameters, [key]: e.target.value })
                    }
                  />
                  {prop.description && (
                    <p className="text-xs text-muted-foreground mt-1">{prop.description}</p>
                  )}
                </div>
              ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExecuteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRunTool}>
              <Play className="mr-2 h-4 w-4" />
              Run Tool
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

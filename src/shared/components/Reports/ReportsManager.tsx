import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FileText, 
  Download, 
  Calendar as CalendarIcon,
  Filter,
  Search,
  Eye,
  Trash2,
  Plus,
  BarChart3,
  TrendingUp,
  Users,
  Car,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useSupabaseQuery, useTenantServices } from '@/shared/hooks/useSupabase';
import { useSupabaseContext } from '@/shared/contexts/SupabaseContext';

interface Report {
  id: string;
  name: string;
  type: 'sales' | 'inventory' | 'marketing' | 'financial' | 'custom';
  description: string;
  status: 'generating' | 'ready' | 'error';
  createdAt: Date;
  generatedAt?: Date;
  parameters: ReportParameters;
  fileUrl?: string;
  fileSize?: number;
}

interface ReportParameters {
  dateRange: {
    start: Date;
    end: Date;
  };
  filters: {
    vehicleStatus?: string[];
    adPlatforms?: string[];
    customerTypes?: string[];
    priceRange?: {
      min: number;
      max: number;
    };
  };
  groupBy?: string;
  includeCharts: boolean;
  format: 'pdf' | 'excel' | 'csv';
}

const REPORT_TYPES = [
  { value: 'sales', label: 'Relatório de Vendas', icon: DollarSign },
  { value: 'inventory', label: 'Relatório de Estoque', icon: Car },
  { value: 'marketing', label: 'Relatório de Marketing', icon: TrendingUp },
  { value: 'financial', label: 'Relatório Financeiro', icon: BarChart3 },
  { value: 'custom', label: 'Relatório Personalizado', icon: FileText }
];

const REPORT_FORMATS = [
  { value: 'pdf', label: 'PDF' },
  { value: 'excel', label: 'Excel (XLSX)' },
  { value: 'csv', label: 'CSV' }
];

const VEHICLE_STATUS_OPTIONS = [
  { value: 'disponivel', label: 'Disponível' },
  { value: 'vendido', label: 'Vendido' },
  { value: 'reservado', label: 'Reservado' },
  { value: 'manutencao', label: 'Em Manutenção' }
];

const AD_PLATFORMS = [
  { value: 'olx', label: 'OLX' },
  { value: 'webmotors', label: 'Webmotors' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'site', label: 'Site Próprio' }
];

export const ReportsManager: React.FC = () => {
  const { user, isAuthenticated } = useSupabaseContext();
  const { vehicle: vehicleService } = useTenantServices();
  
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Estado do formulário de criação de relatório
  const [newReport, setNewReport] = useState<Partial<Report & { parameters: Partial<ReportParameters> }>>({
    name: '',
    type: 'sales',
    description: '',
    parameters: {
      dateRange: {
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        end: new Date()
      },
      filters: {},
      includeCharts: true,
      format: 'pdf'
    }
  });

  // Simular dados de relatórios existentes
  useEffect(() => {
    const mockReports: Report[] = [
      {
        id: '1',
        name: 'Vendas - Dezembro 2024',
        type: 'sales',
        description: 'Relatório completo de vendas do mês de dezembro',
        status: 'ready',
        createdAt: new Date('2024-12-01'),
        generatedAt: new Date('2024-12-01T10:30:00'),
        fileUrl: '/reports/vendas-dezembro-2024.pdf',
        fileSize: 2048576,
        parameters: {
          dateRange: {
            start: new Date('2024-12-01'),
            end: new Date('2024-12-31')
          },
          filters: {},
          includeCharts: true,
          format: 'pdf'
        }
      },
      {
        id: '2',
        name: 'Estoque Atual',
        type: 'inventory',
        description: 'Relatório detalhado do estoque atual de veículos',
        status: 'ready',
        createdAt: new Date('2024-12-15'),
        generatedAt: new Date('2024-12-15T14:20:00'),
        fileUrl: '/reports/estoque-atual.xlsx',
        fileSize: 1536000,
        parameters: {
          dateRange: {
            start: new Date('2024-12-15'),
            end: new Date('2024-12-15')
          },
          filters: {
            vehicleStatus: ['disponivel', 'reservado']
          },
          includeCharts: false,
          format: 'excel'
        }
      },
      {
        id: '3',
        name: 'Performance Marketing - Q4',
        type: 'marketing',
        description: 'Análise de performance das campanhas de marketing no Q4',
        status: 'generating',
        createdAt: new Date('2024-12-20'),
        parameters: {
          dateRange: {
            start: new Date('2024-10-01'),
            end: new Date('2024-12-31')
          },
          filters: {
            adPlatforms: ['facebook', 'instagram', 'olx']
          },
          includeCharts: true,
          format: 'pdf'
        }
      }
    ];
    
    setReports(mockReports);
  }, []);

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || report.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleCreateReport = async () => {
    if (!newReport.name || !newReport.type) return;

    setLoading(true);
    
    try {
      const reportId = Date.now().toString();
      const report: Report = {
        id: reportId,
        name: newReport.name,
        type: newReport.type as Report['type'],
        description: newReport.description || '',
        status: 'generating',
        createdAt: new Date(),
        parameters: {
          dateRange: newReport.parameters?.dateRange || {
            start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            end: new Date()
          },
          filters: newReport.parameters?.filters || {},
          includeCharts: newReport.parameters?.includeCharts || true,
          format: newReport.parameters?.format || 'pdf'
        }
      };

      setReports(prev => [report, ...prev]);
      
      // Simular geração do relatório
      setTimeout(() => {
        setReports(prev => prev.map(r => 
          r.id === reportId 
            ? { 
                ...r, 
                status: 'ready' as const, 
                generatedAt: new Date(),
                fileUrl: `/reports/${r.name.toLowerCase().replace(/\s+/g, '-')}.${r.parameters.format}`,
                fileSize: Math.floor(Math.random() * 5000000) + 500000
              }
            : r
        ));
      }, 3000);
      
      setIsCreateDialogOpen(false);
      setNewReport({
        name: '',
        type: 'sales',
        description: '',
        parameters: {
          dateRange: {
            start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            end: new Date()
          },
          filters: {},
          includeCharts: true,
          format: 'pdf'
        }
      });
    } catch (error) {
      console.error('Erro ao criar relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = (report: Report) => {
    if (report.status !== 'ready' || !report.fileUrl) return;
    
    // Simular download
    console.log(`Baixando relatório: ${report.name}`);
    // Em produção, seria algo como:
    // window.open(report.fileUrl, '_blank');
  };

  const handleDeleteReport = (reportId: string) => {
    setReports(prev => prev.filter(r => r.id !== reportId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: Report['status']) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'generating':
        return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusText = (status: Report['status']) => {
    switch (status) {
      case 'ready':
        return 'Pronto';
      case 'generating':
        return 'Gerando...';
      case 'error':
        return 'Erro';
    }
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Você precisa estar autenticado para acessar os relatórios.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">
            Gere e gerencie relatórios personalizados
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Relatório
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Relatório</DialogTitle>
              <DialogDescription>
                Configure os parâmetros do seu relatório personalizado
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="report-name">Nome do Relatório</Label>
                  <Input
                    id="report-name"
                    value={newReport.name}
                    onChange={(e) => setNewReport(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Vendas - Janeiro 2025"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="report-type">Tipo de Relatório</Label>
                  <Select 
                    value={newReport.type} 
                    onValueChange={(value) => setNewReport(prev => ({ ...prev, type: value as Report['type'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REPORT_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="report-description">Descrição</Label>
                <Input
                  id="report-description"
                  value={newReport.description}
                  onChange={(e) => setNewReport(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição opcional do relatório"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data Inicial</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newReport.parameters?.dateRange?.start 
                          ? format(newReport.parameters.dateRange.start, 'dd/MM/yyyy', { locale: ptBR })
                          : 'Selecionar data'
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newReport.parameters?.dateRange?.start}
                        onSelect={(date) => {
                          if (date) {
                            setNewReport(prev => ({
                              ...prev,
                              parameters: {
                                ...prev.parameters,
                                dateRange: {
                                  ...prev.parameters?.dateRange,
                                  start: date
                                }
                              }
                            }));
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label>Data Final</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newReport.parameters?.dateRange?.end 
                          ? format(newReport.parameters.dateRange.end, 'dd/MM/yyyy', { locale: ptBR })
                          : 'Selecionar data'
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newReport.parameters?.dateRange?.end}
                        onSelect={(date) => {
                          if (date) {
                            setNewReport(prev => ({
                              ...prev,
                              parameters: {
                                ...prev.parameters,
                                dateRange: {
                                  ...prev.parameters?.dateRange,
                                  end: date
                                }
                              }
                            }));
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Formato do Arquivo</Label>
                <Select 
                  value={newReport.parameters?.format} 
                  onValueChange={(value) => setNewReport(prev => ({
                    ...prev,
                    parameters: {
                      ...prev.parameters,
                      format: value as 'pdf' | 'excel' | 'csv'
                    }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_FORMATS.map(format => (
                      <SelectItem key={format.value} value={format.value}>
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="include-charts"
                  checked={newReport.parameters?.includeCharts}
                  onCheckedChange={(checked) => setNewReport(prev => ({
                    ...prev,
                    parameters: {
                      ...prev.parameters,
                      includeCharts: checked as boolean
                    }
                  }))}
                />
                <Label htmlFor="include-charts">Incluir gráficos e visualizações</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateReport} disabled={loading || !newReport.name}>
                {loading ? 'Criando...' : 'Criar Relatório'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar relatórios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {REPORT_TYPES.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Relatórios */}
      <div className="grid gap-4">
        {filteredReports.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum relatório encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || selectedType !== 'all' 
                    ? 'Tente ajustar os filtros de busca'
                    : 'Crie seu primeiro relatório para começar'
                  }
                </p>
                {!searchTerm && selectedType === 'all' && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Relatório
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredReports.map(report => {
            const ReportIcon = REPORT_TYPES.find(t => t.value === report.type)?.icon || FileText;
            
            return (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <ReportIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{report.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {report.description}
                        </CardDescription>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                          <span>
                            Criado em {format(report.createdAt, 'dd/MM/yyyy', { locale: ptBR })}
                          </span>
                          {report.generatedAt && (
                            <span>
                              Gerado em {format(report.generatedAt, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </span>
                          )}
                          {report.fileSize && (
                            <span>{formatFileSize(report.fileSize)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(report.status)}
                        <Badge variant={report.status === 'ready' ? 'default' : report.status === 'generating' ? 'secondary' : 'destructive'}>
                          {getStatusText(report.status)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Badge variant="outline">
                        {REPORT_TYPES.find(t => t.value === report.type)?.label}
                      </Badge>
                      <Badge variant="outline">
                        {report.parameters.format.toUpperCase()}
                      </Badge>
                      {report.parameters.includeCharts && (
                        <Badge variant="outline">
                          <BarChart3 className="h-3 w-3 mr-1" />
                          Com gráficos
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadReport(report)}
                        disabled={report.status !== 'ready'}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Baixar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteReport(report.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ReportsManager;
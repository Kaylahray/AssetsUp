import React, { useState, useCallback } from 'react';
import { 
  Search, 
  Plus, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Building, 
  User, 
  Eye, 
  Edit, 
  Trash2, 
  ArrowLeft, 
  Upload, 
  QrCode,
  AlertCircle,
  Shield,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

// Types
interface Certificate {
  id: string;
  assetName: string;
  assetType: string;
  owner: string;
  issuanceDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'revoked';
  issuer: string;
  description: string;
  serialNumber: string;
  documents: string[];
  verificationCode: string;
}

interface CertificateFormData {
  assetName: string;
  assetType: string;
  owner: string;
  expiryDate: string;
  description: string;
  documents: string[];
}

type View = 'list' | 'detail' | 'issue' | 'verify';

const AssetCertificateManager: React.FC = () => {
  // Sample data
  const [certificates, setCertificates] = useState<Certificate[]>([
    {
      id: '1',
      assetName: 'Industrial Building A',
      assetType: 'Real Estate',
      owner: 'ABC Corporation',
      issuanceDate: '2024-01-15',
      expiryDate: '2026-01-15',
      status: 'active',
      issuer: 'National Asset Authority',
      description: 'Commercial industrial building located in downtown business district',
      serialNumber: 'NAA-2024-001',
      documents: ['deed.pdf', 'inspection_report.pdf'],
      verificationCode: 'VER-ABC-001'
    },
    {
      id: '2',
      assetName: 'Fleet Vehicle #205',
      assetType: 'Vehicle',
      owner: 'Transport Solutions Ltd',
      issuanceDate: '2024-03-10',
      expiryDate: '2025-03-10',
      status: 'active',
      issuer: 'Motor Vehicle Authority',
      description: 'Heavy-duty delivery truck with specialized equipment',
      serialNumber: 'MVA-2024-205',
      documents: ['registration.pdf', 'insurance.pdf'],
      verificationCode: 'VER-TSL-205'
    },
    {
      id: '3',
      assetName: 'Manufacturing Equipment Set',
      assetType: 'Equipment',
      owner: 'TechManufacturing Inc',
      issuanceDate: '2023-11-20',
      expiryDate: '2024-11-20',
      status: 'expired',
      issuer: 'Industrial Equipment Board',
      description: 'Precision manufacturing equipment for electronic components',
      serialNumber: 'IEB-2023-789',
      documents: ['warranty.pdf', 'calibration_cert.pdf'],
      verificationCode: 'VER-TMI-789'
    }
  ]);

  const [currentView, setCurrentView] = useState<View>('list');
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('issuanceDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [verificationInput, setVerificationInput] = useState('');
  const [verificationResult, setVerificationResult] = useState<{ status: 'valid' | 'invalid' | 'expired' | null; certificate?: Certificate }>({ status: null });
  const [formData, setFormData] = useState<CertificateFormData>({
    assetName: '',
    assetType: '',
    owner: '',
    expiryDate: '',
    description: '',
    documents: []
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  const itemsPerPage = 5;

  // Filter and sort certificates
  const filteredCertificates = certificates
    .filter(cert => {
      const matchesSearch = cert.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cert.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cert.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || cert.status === statusFilter;
      const matchesType = typeFilter === 'all' || cert.assetType === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      const aValue = a[sortField as keyof Certificate];
      const bValue = b[sortField as keyof Certificate];
      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const totalPages = Math.ceil(filteredCertificates.length / itemsPerPage);
  const paginatedCertificates = filteredCertificates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: Certificate['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'expired':
        return <Badge className="bg-yellow-100 text-yellow-800"><Calendar className="w-3 h-3 mr-1" />Expired</Badge>;
      case 'revoked':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Revoked</Badge>;
      default:
        return null;
    }
  };

  const handleViewCertificate = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setCurrentView('detail');
  };

  const handleIssueNew = () => {
    setFormData({
      assetName: '',
      assetType: '',
      owner: '',
      expiryDate: '',
      description: '',
      documents: []
    });
    setFormErrors({});
    setSuccessMessage('');
    setCurrentView('issue');
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.assetName.trim()) errors.assetName = 'Asset name is required';
    if (!formData.assetType) errors.assetType = 'Asset type is required';
    if (!formData.owner.trim()) errors.owner = 'Owner is required';
    if (!formData.expiryDate) errors.expiryDate = 'Expiry date is required';
    if (!formData.description.trim()) errors.description = 'Description is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitCertificate = () => {
    if (!validateForm()) return;

    const newCertificate: Certificate = {
      id: (certificates.length + 1).toString(),
      ...formData,
      issuanceDate: new Date().toISOString().split('T')[0],
      status: 'active',
      issuer: 'System Administrator',
      serialNumber: `SYS-${new Date().getFullYear()}-${String(certificates.length + 1).padStart(3, '0')}`,
      verificationCode: `VER-${formData.assetName.substring(0, 3).toUpperCase()}-${certificates.length + 1}`
    };

    setCertificates([...certificates, newCertificate]);
    setSuccessMessage('Certificate issued successfully!');
    
    setTimeout(() => {
      setCurrentView('list');
      setSuccessMessage('');
    }, 2000);
  };

  const handleVerifyCertificate = () => {
    const certificate = certificates.find(cert => 
      cert.verificationCode === verificationInput || 
      cert.serialNumber === verificationInput ||
      cert.id === verificationInput
    );

    if (!certificate) {
      setVerificationResult({ status: 'invalid' });
    } else if (certificate.status === 'expired') {
      setVerificationResult({ status: 'expired', certificate });
    } else if (certificate.status === 'revoked') {
      setVerificationResult({ status: 'invalid', certificate });
    } else {
      setVerificationResult({ status: 'valid', certificate });
    }
  };

  const handleRevokeCertificate = (certificateId: string) => {
    setCertificates(certificates.map(cert => 
      cert.id === certificateId ? { ...cert, status: 'revoked' as const } : cert
    ));
    if (selectedCertificate?.id === certificateId) {
      setSelectedCertificate({ ...selectedCertificate, status: 'revoked' });
    }
  };

  // Certificate List View
  const renderListView = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Asset Certificate Management</h1>
          <p className="text-gray-600 mt-1">Manage and track asset certificates</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setCurrentView('verify')} variant="outline">
            <Shield className="w-4 h-4 mr-2" />
            Verify Certificate
          </Button>
          <Button onClick={handleIssueNew}>
            <Plus className="w-4 h-4 mr-2" />
            Issue New Certificate
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
              <Input
                placeholder="Search certificates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="revoked">Revoked</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Real Estate">Real Estate</SelectItem>
                <SelectItem value="Vehicle">Vehicle</SelectItem>
                <SelectItem value="Equipment">Equipment</SelectItem>
              </SelectContent>
            </Select>

            <Select value={`${sortField}-${sortOrder}`} onValueChange={(value) => {
              const [field, order] = value.split('-');
              setSortField(field);
              setSortOrder(order as 'asc' | 'desc');
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="issuanceDate-desc">Newest First</SelectItem>
                <SelectItem value="issuanceDate-asc">Oldest First</SelectItem>
                <SelectItem value="assetName-asc">Asset A-Z</SelectItem>
                <SelectItem value="assetName-desc">Asset Z-A</SelectItem>
                <SelectItem value="status-asc">Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Certificate List */}
      <div className="space-y-4">
        {paginatedCertificates.map((certificate) => (
          <Card key={certificate.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{certificate.assetName}</h3>
                      <p className="text-sm text-gray-600">{certificate.assetType}</p>
                      <p className="text-sm text-gray-500">ID: {certificate.serialNumber}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{certificate.owner}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Issued: {certificate.issuanceDate}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-2">
                      {getStatusBadge(certificate.status)}
                      <span className="text-xs text-gray-500">Expires: {certificate.expiryDate}</span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => handleViewCertificate(certificate)}
                  variant="outline"
                  size="sm"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredCertificates.length)} of {filteredCertificates.length} certificates
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  // Certificate Detail View
  const renderDetailView = () => {
    if (!selectedCertificate) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentView('list')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Certificate List
          </Button>
          <div className="flex gap-2">
            {selectedCertificate.status === 'active' && (
              <>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Certificate
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRevokeCertificate(selectedCertificate.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Revoke Certificate
                </Button>
              </>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle className="text-2xl">{selectedCertificate.assetName}</CardTitle>
                <CardDescription className="text-lg">
                  {selectedCertificate.assetType} Certificate
                </CardDescription>
              </div>
              {getStatusBadge(selectedCertificate.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Certificate ID</Label>
                  <p className="mt-1 text-gray-900">{selectedCertificate.serialNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Asset Owner</Label>
                  <p className="mt-1 text-gray-900">{selectedCertificate.owner}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Issuing Authority</Label>
                  <p className="mt-1 text-gray-900">{selectedCertificate.issuer}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Verification Code</Label>
                  <p className="mt-1 font-mono text-sm bg-gray-100 p-2 rounded">
                    {selectedCertificate.verificationCode}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Issuance Date</Label>
                  <p className="mt-1 text-gray-900">{selectedCertificate.issuanceDate}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Expiry Date</Label>
                  <p className="mt-1 text-gray-900">{selectedCertificate.expiryDate}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Asset Type</Label>
                  <p className="mt-1 text-gray-900">{selectedCertificate.assetType}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-sm font-medium text-gray-600">Description</Label>
              <p className="mt-2 text-gray-900 leading-relaxed">{selectedCertificate.description}</p>
            </div>

            {selectedCertificate.documents.length > 0 && (
              <>
                <Separator />
                <div>
                  <Label className="text-sm font-medium text-gray-600 mb-3 block">
                    Associated Documents
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedCertificate.documents.map((doc, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <span className="text-sm text-gray-700">{doc}</span>
                        <Button size="sm" variant="ghost" className="ml-auto">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // Certificate Issuance Form
  const renderIssueView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentView('list')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Certificate List
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Issue New Asset Certificate</CardTitle>
          <CardDescription>
            Create and issue a new certificate for an asset
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {successMessage && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="assetName">Asset Name *</Label>
                <Input
                  id="assetName"
                  value={formData.assetName}
                  onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
                  placeholder="Enter asset name"
                  className={formErrors.assetName ? 'border-red-500' : ''}
                />
                {formErrors.assetName && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.assetName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="assetType">Asset Type *</Label>
                <Select value={formData.assetType} onValueChange={(value) => setFormData({ ...formData, assetType: value })}>
                  <SelectTrigger className={formErrors.assetType ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select asset type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Real Estate">Real Estate</SelectItem>
                    <SelectItem value="Vehicle">Vehicle</SelectItem>
                    <SelectItem value="Equipment">Equipment</SelectItem>
                    <SelectItem value="Intellectual Property">Intellectual Property</SelectItem>
                    <SelectItem value="Financial Instrument">Financial Instrument</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.assetType && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.assetType}</p>
                )}
              </div>

              <div>
                <Label htmlFor="owner">Asset Owner *</Label>
                <Input
                  id="owner"
                  value={formData.owner}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  placeholder="Enter owner name or organization"
                  className={formErrors.owner ? 'border-red-500' : ''}
                />
                {formErrors.owner && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.owner}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="expiryDate">Expiry Date *</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className={formErrors.expiryDate ? 'border-red-500' : ''}
                  min={new Date().toISOString().split('T')[0]}
                />
                {formErrors.expiryDate && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.expiryDate}</p>
                )}
              </div>

              <div>
                <Label htmlFor="documents">Supporting Documents</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Drag and drop files here, or{' '}
                    <Button variant="link" className="p-0 h-auto">
                      browse files
                    </Button>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB each)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Asset Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide a detailed description of the asset"
              rows={4}
              className={formErrors.description ? 'border-red-500' : ''}
            />
            {formErrors.description && (
              <p className="text-sm text-red-600 mt-1">{formErrors.description}</p>
            )}
          </div>

          <Separator />

          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => setCurrentView('list')}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitCertificate}>
              <FileText className="w-4 h-4 mr-2" />
              Issue Certificate
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Certificate Verification Interface
  const renderVerifyView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentView('list')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Certificate List
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Certificate Verification
          </CardTitle>
          <CardDescription>
            Verify the authenticity and status of an asset certificate
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="verificationInput">Certificate Identifier</Label>
              <div className="mt-2 flex gap-2">
                <Input
                  id="verificationInput"
                  value={verificationInput}
                  onChange={(e) => setVerificationInput(e.target.value)}
                  placeholder="Enter certificate ID, serial number, or verification code"
                  className="flex-1"
                />
                <Button onClick={() => {/* QR scanner would go here */}} variant="outline">
                  <QrCode className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                You can scan a QR code or manually enter the certificate identifier
              </p>
            </div>

            <Button onClick={handleVerifyCertificate} className="w-full">
              <Shield className="w-4 h-4 mr-2" />
              Verify Certificate
            </Button>
          </div>

          {verificationResult.status && (
            <div className="mt-6">
              {verificationResult.status === 'valid' && verificationResult.certificate && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium text-green-800">Certificate is Valid</p>
                      <div className="text-sm text-green-700">
                        <p><strong>Asset:</strong> {verificationResult.certificate.assetName}</p>
                        <p><strong>Owner:</strong> {verificationResult.certificate.owner}</p>
                        <p><strong>Status:</strong> Active</p>
                        <p><strong>Expires:</strong> {verificationResult.certificate.expiryDate}</p>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {verificationResult.status === 'expired' && verificationResult.certificate && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium text-yellow-800">Certificate is Expired</p>
                      <div className="text-sm text-yellow-700">
                        <p><strong>Asset:</strong> {verificationResult.certificate.assetName}</p>
                        <p><strong>Owner:</strong> {verificationResult.certificate.owner}</p>
                        <p><strong>Expired on:</strong> {verificationResult.certificate.expiryDate}</p>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {verificationResult.status === 'invalid' && (
                <Alert className="border-red-200 bg-red-50">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium text-red-800">Certificate Not Found or Invalid</p>
                      <div className="text-sm text-red-700">
                        <p>The certificate identifier you entered could not be verified.</p>
                        <p className="mt-2">If you believe this is an error, please:</p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          <li>Double-check the certificate identifier</li>
                          <li>Contact the issuing authority</li>
                          <li>Email support@assetcertification.com</li>
                        </ul>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Main render function
  const renderCurrentView = () => {
    switch (currentView) {
      case 'list':
        return renderListView();
      case 'detail':
        return renderDetailView();
      case 'issue':
        return renderIssueView();
      case 'verify':
        return renderVerifyView();
      default:
        return renderListView();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {renderCurrentView()}
      </div>
    </div>
  );
};

export default AssetCertificateManager;
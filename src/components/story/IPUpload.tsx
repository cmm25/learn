"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText } from "lucide-react"
import { IPMetadata, LicenseOptions } from "@/utils/storyProtocolService"

interface IPUploadProps {
  onSubmit: (file: File, metadata: IPMetadata, licenseOptions: LicenseOptions) => void
  onBack: () => void
}

export function IPUpload({ onSubmit, onBack }: IPUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string>("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [creator, setCreator] = useState("")
  const [licenseType, setLicenseType] = useState<LicenseOptions['type']>("non-commercial")

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0]
    if (uploadedFile) {
      // Validate file size (10MB limit)
      if (uploadedFile.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB")
        return
      }

      // Validate file type
      const acceptedTypes = ['image/', 'text/plain', 'application/pdf']
      const isValidType = acceptedTypes.some(type => 
        type.includes('/') ? uploadedFile.type.startsWith(type) : uploadedFile.type === type
      )
      
      if (!isValidType) {
        alert("Please select a valid file (image, text, or PDF)")
        return
      }

      setFile(uploadedFile)
      
      // Preview for images
      if (uploadedFile.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setFilePreview(e.target?.result as string)
        }
        reader.readAsDataURL(uploadedFile)
      } else {
        // For text/PDF, just show file name
        setFilePreview(uploadedFile.name)
      }
    }
  }

  const handleSubmit = () => {
    if (!file || !title || !description || !creator) return

    const metadata: IPMetadata = {
      title,
      description,
      creator,
      ipType: file.type === "application/pdf" ? "PDF Document" : 
              file.type === "text/plain" ? "Text Document" : "Image"
    }

    const licenseOptions: LicenseOptions = {
      type: licenseType
    }

    onSubmit(file, metadata, licenseOptions)
  }

  return (
    <Card className="w-full max-w-2xl shadow-lg border-0">
      <CardHeader className="space-y-1 pb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
            <Upload className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Upload Intellectual Property</CardTitle>
            <CardDescription className="text-gray-600">
              Register your creative work on the blockchain with custom licensing terms
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-gray-700 font-semibold">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Enter a title for your IP"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="py-2.5 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="creator" className="text-gray-700 font-semibold">
              Creator Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="creator"
              placeholder="Your name or pseudonym"
              value={creator}
              onChange={(e) => setCreator(e.target.value)}
              className="py-2.5 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="file" className="text-gray-700 font-semibold">
            Upload File <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="file"
              type="file"
              accept="image/*,.txt,.pdf"
              onChange={handleFileUpload}
              className="py-2.5 bg-gray-50 border-gray-200 h-12 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1.5">
              Supported: Images (JPG, PNG, GIF), Text files, PDFs • Max size: 10MB
            </p>
          </div>
        </div>

        {filePreview && (
          <div className="relative p-4 bg-gray-50 rounded-lg border border-gray-200">
            {file?.type.startsWith('image/') ? (
              <div className="relative w-full h-64">
                <Image
                  src={filePreview}
                  alt="Preview"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white rounded-lg">
                  <FileText className="h-10 w-10 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-700 font-semibold">{filePreview}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {file?.type === "application/pdf" ? "PDF Document" : "Text Document"}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="description" className="text-gray-700 font-semibold">
            Description <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="description"
            placeholder="Describe your intellectual property..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[100px] bg-gray-50 border-gray-200 focus:bg-white transition-colors resize-none"
            rows={4}
          />
          <p className="text-xs text-gray-500">
            Provide a clear description of your work and its unique aspects
          </p>
        </div>

        <div className="space-y-3">
          <Label className="text-gray-700 font-semibold block">
            License Terms <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-gray-600">
            Select how others can use and build upon your work
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
              licenseType === "non-commercial" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
            }`}>
              <input
                type="radio"
                name="licenseType"
                value="non-commercial"
                checked={licenseType === "non-commercial"}
                onChange={(e) => setLicenseType(e.target.value as LicenseOptions['type'])}
                className="sr-only"
              />
              <div className="flex-1">
                <p className="font-semibold text-gray-900 flex items-center">
                  Non-Commercial Social Remixing
                  {licenseType === "non-commercial" && (
                    <span className="ml-2 text-blue-600">✓</span>
                  )}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Free remixing for non-commercial purposes with attribution
                </p>
                <p className="text-xs text-green-600 mt-1 font-medium">
                  ✓ Derivatives allowed
                </p>
              </div>
            </label>

            <label className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
              licenseType === "commercial-use" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
            }`}>
              <input
                type="radio"
                name="licenseType"
                value="commercial-use"
                checked={licenseType === "commercial-use"}
                onChange={(e) => setLicenseType(e.target.value as LicenseOptions['type'])}
                className="sr-only"
              />
              <div className="flex-1">
                <p className="font-semibold text-gray-900 flex items-center">
                  Commercial Use
                  {licenseType === "commercial-use" && (
                    <span className="ml-2 text-blue-600">✓</span>
                  )}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Uses same terms as non-commercial (platform limitation)
                </p>
                <p className="text-xs text-amber-600 mt-1 font-medium">
                  ⚠️ Derivatives allowed (not restricted)
                </p>
              </div>
            </label>

            <label className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
              licenseType === "commercial-remix" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
            }`}>
              <input
                type="radio"
                name="licenseType"
                value="commercial-remix"
                checked={licenseType === "commercial-remix"}
                onChange={(e) => setLicenseType(e.target.value as LicenseOptions['type'])}
                className="sr-only"
              />
              <div className="flex-1">
                <p className="font-semibold text-gray-900 flex items-center">
                  Commercial Remix
                  {licenseType === "commercial-remix" && (
                    <span className="ml-2 text-blue-600">✓</span>
                  )}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Uses pre-configured commercial remix terms (ID: 3)
                </p>
                <p className="text-xs text-green-600 mt-1 font-medium">
                  ✓ Commercial derivatives with revenue sharing
                </p>
              </div>
            </label>

                      </div>
        </div>

        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
          <div className="flex items-start space-x-3">
            <span className="text-amber-600 text-lg">ℹ️</span>
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-1">Platform Note</h4>
              <p className="text-xs text-gray-700 leading-relaxed">
                Story Protocol uses pre-configured license terms. Custom terms registration requires special token setup. 
                All options above use existing license IDs that allow derivatives.
              </p>
            </div>
          </div>
        </div>

        <div className="flex space-x-4 pt-4">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold"
          >
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!file || !title || !description || !creator}
            className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Continue to Review
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
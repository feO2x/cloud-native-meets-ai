'use client';

import React, { useState } from 'react';
import { Button, Modal, message, Space, Upload, Typography, Image } from 'antd';
import { PictureOutlined, LoadingOutlined, UploadOutlined, EyeOutlined } from '@ant-design/icons';
import { VehicleDamageDto, PersonalDataDto, CircumstancesDto, AnalyzeImageRequestDto, ImageAnalysisResponseDto, FormSection } from '../../types/damage-reports';
import { uuidv7 } from 'uuidv7';

const { Text } = Typography;
const { Dragger } = Upload;

interface SmartImageButtonProps {
  onAnalysisComplete: (result: Partial<VehicleDamageDto>) => void;
  existingPersonalData: PersonalDataDto;
  existingCircumstances: CircumstancesDto;
}

export const SmartImageButton: React.FC<SmartImageButtonProps> = ({ 
  onAnalysisComplete, 
  existingPersonalData, 
  existingCircumstances 
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedImageId, setUploadedImageId] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleOpenModal = () => {
    setIsModalVisible(true);
    setUploadedImageId(null);
    setImagePreviewUrl(null);
    setSelectedFile(null);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setUploadedImageId(null);
    setImagePreviewUrl(null);
    setSelectedFile(null);
    setIsUploading(false);
    setIsAnalyzing(false);
  };

  const handleFileSelect = async (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().match(/\.(jpg|jpeg|png)$/)) {
      message.error('Please upload a JPG or PNG image file');
      return false;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      message.error('Image file must be smaller than 10MB');
      return false;
    }

    setSelectedFile(file);
    setIsUploading(true);

    try {
      // Generate UUID v7 for the image
      const imageId = uuidv7();
      
      // Upload the image
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch(`/api/media/${imageId}`, {
        method: 'PUT',
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error(`Image upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }

      setUploadedImageId(imageId);
      setImagePreviewUrl(`/api/media/${imageId}`);
      message.success('Image uploaded successfully!');

    } catch (error) {
      console.error('Error uploading image:', error);
      message.error('Failed to upload image. Please try again.');
      setSelectedFile(null);
    } finally {
      setIsUploading(false);
    }

    return false; // Prevent auto upload by Upload component
  };

  const handleAnalyze = async () => {
    if (!uploadedImageId) {
      message.warning('Please upload an image first');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Combine existing data for context
      const existingData = {
        ...existingPersonalData,
        ...existingCircumstances
      };

      const requestDto: AnalyzeImageRequestDto = {
        formSection: FormSection.VehicleDamage,
        imageId: uploadedImageId,
        existingDamageReportData: existingData as Record<string, unknown>
      };

      const response = await fetch('/api/analyze/image', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestDto)
      });

      if (!response.ok) {
        throw new Error(`Image analysis failed: ${response.status} ${response.statusText}`);
      }

      const analysisResponse: ImageAnalysisResponseDto = await response.json();
      
      // Extract only defined values from the analysis result
      const extractedData: Partial<VehicleDamageDto> = {};
      Object.entries(analysisResponse.analysisResult).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          (extractedData as Record<string, unknown>)[key] = value;
        }
      });

      message.success('AI image analysis completed successfully!');
      onAnalysisComplete(extractedData);
      handleCancel(); // Close modal
      
    } catch (error) {
      console.error('Error during AI image analysis:', error);
      message.error('Failed to analyze image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      <Button 
        type="primary"
        size="large"
        icon={<PictureOutlined />}
        onClick={handleOpenModal}
        style={{ 
          marginBottom: '20px',
          background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 'bold',
          height: '48px',
          paddingLeft: '24px',
          paddingRight: '24px',
          boxShadow: '0 4px 15px 0 rgba(82, 196, 26, 0.3)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 20px 0 rgba(82, 196, 26, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px 0 rgba(82, 196, 26, 0.3)';
        }}
      >
        📸 Smart Image
      </Button>

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <PictureOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
            Let AI analyze your image
          </div>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        width={600}
        footer={
          <Space>
            <Button onClick={handleCancel} disabled={isAnalyzing}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              onClick={handleAnalyze}
              loading={isAnalyzing}
              icon={isAnalyzing ? <LoadingOutlined /> : <PictureOutlined />}
              disabled={!uploadedImageId}
            >
              {isAnalyzing ? 'AI Analyzing...' : 'AI Analyze'}
            </Button>
          </Space>
        }
      >
        {isAnalyzing ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>
              <LoadingOutlined spin style={{ color: '#52c41a' }} />
            </div>
            <div style={{ fontSize: '16px', color: '#52c41a', marginBottom: '8px' }}>
              📸 AI is analyzing your image...
            </div>
            <div style={{ color: '#666' }}>
              Detecting vehicle damage and extracting information
            </div>
          </div>
        ) : (
          <div>
            <p style={{ marginBottom: '24px', textAlign: 'center' }}>
              Upload an image of your vehicle showing any damage. 
              Our AI will analyze the image and identify damaged parts automatically.
            </p>
            
            {!uploadedImageId ? (
              <Dragger
                accept="image/*,.jpg,.jpeg,.png"
                beforeUpload={handleFileSelect}
                showUploadList={false}
                multiple={false}
                style={{ 
                  marginBottom: '16px',
                  border: '2px dashed #52c41a',
                  borderRadius: '8px',
                  padding: '40px 20px'
                }}
              >
                <p className="ant-upload-drag-icon">
                  <UploadOutlined style={{ fontSize: '48px', color: '#52c41a' }} />
                </p>
                <p className="ant-upload-text" style={{ fontSize: '16px', fontWeight: 'bold' }}>
                  Click or drag image to upload
                </p>
                <p className="ant-upload-hint" style={{ color: '#666' }}>
                  Supports JPG and PNG formats. Maximum size: 10MB
                </p>
                {isUploading && (
                  <div style={{ marginTop: '16px' }}>
                    <LoadingOutlined spin style={{ marginRight: '8px' }} />
                    Uploading image...
                  </div>
                )}
              </Dragger>
            ) : (
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <div style={{ 
                  border: '2px solid #52c41a', 
                  borderRadius: '8px', 
                  padding: '16px',
                  backgroundColor: '#f6ffed'
                }}>
                  {imagePreviewUrl && (
                    <div style={{ marginBottom: '16px' }}>
                      <Image
                        src={imagePreviewUrl}
                        alt="Uploaded vehicle image"
                        style={{ maxWidth: '100%', maxHeight: '300px' }}
                        preview={{
                          mask: (
                            <div style={{ color: 'white' }}>
                              <EyeOutlined /> Preview
                            </div>
                          )
                        }}
                      />
                    </div>
                  )}
                  <div style={{ color: '#52c41a', fontSize: '16px', fontWeight: 'bold' }}>
                    ✅ Image uploaded successfully!
                  </div>
                  <div style={{ color: '#666', fontSize: '12px', marginTop: '8px' }}>
                    {selectedFile?.name}
                  </div>
                  <Button 
                    type="link" 
                    onClick={() => {
                      setUploadedImageId(null);
                      setImagePreviewUrl(null);
                      setSelectedFile(null);
                    }}
                    style={{ color: '#52c41a', marginTop: '8px' }}
                  >
                    Upload different image
                  </Button>
                </div>
              </div>
            )}

            <div style={{ 
              padding: '12px', 
              backgroundColor: '#e6fffb', 
              borderRadius: '6px',
              border: '1px solid #87e8de'
            }}>
              <Text style={{ fontSize: '12px', color: '#13c2c2' }}>
                💡 <strong>Tip:</strong> Take clear photos showing vehicle damage from multiple angles. 
                Include close-ups of scratches, dents, or other visible damage for best AI analysis results.
              </Text>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

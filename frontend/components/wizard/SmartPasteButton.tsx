'use client';

import React, { useState } from 'react';
import { Button, Modal, Input, message, Space } from 'antd';
import { RobotOutlined, LoadingOutlined } from '@ant-design/icons';
import { PersonalDataDto, AnalyzeTextRequestDto, AnalysisResponseDto, FormSection } from '../../types/damage-reports';

const { TextArea } = Input;

interface SmartPasteButtonProps {
  onAnalysisComplete: (result: Partial<PersonalDataDto>) => void;
  existingData: PersonalDataDto;
}

export const SmartPasteButton: React.FC<SmartPasteButtonProps> = ({ onAnalysisComplete, existingData }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [textToAnalyze, setTextToAnalyze] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleOpenModal = () => {
    setIsModalVisible(true);
    setTextToAnalyze('');
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setTextToAnalyze('');
    setIsAnalyzing(false);
  };

  const handleAnalyze = async () => {
    if (!textToAnalyze.trim()) {
      message.warning('Please paste some text to analyze');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const requestBody: AnalyzeTextRequestDto = {
        formSection: FormSection.PersonalData,
        textToAnalyze: textToAnalyze.trim(),
        existingDamageReportData: existingData as unknown as Record<string, unknown>
      };

      const response = await fetch('/api/analyze/text', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status} ${response.statusText}`);
      }

      const analysisResponse: AnalysisResponseDto = await response.json();
      
      // Extract only defined values from the analysis result
      const extractedData: Partial<PersonalDataDto> = {};
      Object.entries(analysisResponse.analysisResult).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          (extractedData as Record<string, unknown>)[key] = value;
        }
      });

      message.success('AI analysis completed successfully!');
      onAnalysisComplete(extractedData);
      handleCancel(); // Close modal
      
    } catch (error) {
      console.error('Error during AI analysis:', error);
      message.error('Failed to analyze text. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      <Button 
        type="dashed" 
        icon={<RobotOutlined />}
        onClick={handleOpenModal}
        style={{ marginBottom: '16px' }}
      >
        Smart Paste
      </Button>

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <RobotOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
            Let AI analyze the pasted text
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
              icon={isAnalyzing ? <LoadingOutlined /> : <RobotOutlined />}
            >
              {isAnalyzing ? 'AI Analyzing...' : 'AI Analyze'}
            </Button>
          </Space>
        }
      >
        {isAnalyzing ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>
              <LoadingOutlined spin style={{ color: '#1890ff' }} />
            </div>
            <div style={{ fontSize: '16px', color: '#1890ff', marginBottom: '8px' }}>
              🤖 AI is analyzing your text...
            </div>
            <div style={{ color: '#666' }}>
              Extracting personal data information
            </div>
          </div>
        ) : (
          <div>
            <p style={{ marginBottom: '16px' }}>
              Paste any text containing personal information (like an email, document, or form) 
              and let AI extract the relevant data for you.
            </p>
            <TextArea
              placeholder="Paste your text here... 

For example:
• Email signatures
• Business cards
• Form data
• Identity documents
• Any text with personal information"
              value={textToAnalyze}
              onChange={(e) => setTextToAnalyze(e.target.value)}
              rows={8}
              style={{ marginBottom: '16px' }}
            />
          </div>
        )}
      </Modal>
    </>
  );
};

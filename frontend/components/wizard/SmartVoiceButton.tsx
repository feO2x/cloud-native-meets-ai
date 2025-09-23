'use client';

import React, { useState, useRef } from 'react';
import { Button, Modal, message, Space, Upload, Typography } from 'antd';
import { AudioOutlined, LoadingOutlined, UploadOutlined, PlayCircleOutlined, StopOutlined } from '@ant-design/icons';
import { CircumstancesDto, PersonalDataDto, AnalyzeSpeechRequestDto, SpeechAnalysisResponseDto, FormSection } from '../../types/damage-reports';

const { Text } = Typography;

interface SmartVoiceButtonProps {
  onAnalysisComplete: (result: Partial<CircumstancesDto>) => void;
  existingPersonalData: PersonalDataDto;
}

export const SmartVoiceButton: React.FC<SmartVoiceButtonProps> = ({ onAnalysisComplete, existingPersonalData }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleOpenModal = () => {
    setIsModalVisible(true);
    setAudioFile(null);
    setRecordedAudio(null);
    setRecordingTime(0);
  };

  const handleCancel = () => {
    stopRecording();
    setIsModalVisible(false);
    setAudioFile(null);
    setRecordedAudio(null);
    setIsAnalyzing(false);
    setRecordingTime(0);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        setRecordedAudio(audioBlob);
        setAudioFile(null); // Clear uploaded file if recording
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      message.error('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const handleFileUpload = (file: File) => {
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3'];
    if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().match(/\.(mp3|wav)$/)) {
      message.error('Please upload an MP3 or WAV audio file');
      return false;
    }
    
    setAudioFile(file);
    setRecordedAudio(null); // Clear recorded audio if uploading
    return false; // Prevent auto upload
  };

  const handleAnalyze = async () => {
    const audioToAnalyze = recordedAudio || audioFile;
    if (!audioToAnalyze) {
      message.warning('Please record audio or upload an audio file');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const formData = new FormData();
      
      // Add JSON data
      const requestDto: AnalyzeSpeechRequestDto = {
        formSection: FormSection.Circumstances,
        existingDamageReportData: existingPersonalData
      };
      
      const jsonBlob = new Blob([JSON.stringify(requestDto)], { 
        type: 'application/json' 
      });
      formData.append('json', jsonBlob);
      
      // Add audio file
      const audioFileToSend = recordedAudio ? 
        new File([recordedAudio], 'recording.wav', { type: 'audio/wav' }) : 
        audioFile!;
      
      formData.append('audio', audioFileToSend);

      const response = await fetch('/api/analyze/speech', {
        method: 'PUT',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Speech analysis failed: ${response.status} ${response.statusText}`);
      }

      const analysisResponse: SpeechAnalysisResponseDto = await response.json();
      
      // Extract only defined values from the analysis result
      const extractedData: Partial<CircumstancesDto> = {};
      Object.entries(analysisResponse.analysisResult).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '' && 
            !(Array.isArray(value) && value.length === 0)) {
          (extractedData as Record<string, unknown>)[key] = value;
        }
      });

      message.success('AI speech analysis completed successfully!');
      onAnalysisComplete(extractedData);
      handleCancel(); // Close modal
      
    } catch (error) {
      console.error('Error during AI speech analysis:', error);
      message.error('Failed to analyze speech. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <Button 
        type="primary"
        size="large"
        icon={<AudioOutlined />}
        onClick={handleOpenModal}
        style={{ 
          marginBottom: '20px',
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 'bold',
          height: '48px',
          paddingLeft: '24px',
          paddingRight: '24px',
          boxShadow: '0 4px 15px 0 rgba(255, 107, 107, 0.3)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 20px 0 rgba(255, 107, 107, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px 0 rgba(255, 107, 107, 0.3)';
        }}
      >
        🎤 Smart Voice
      </Button>

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <AudioOutlined style={{ marginRight: '8px', color: '#ff6b6b' }} />
            Let AI analyze your voice
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
              icon={isAnalyzing ? <LoadingOutlined /> : <AudioOutlined />}
              disabled={!audioFile && !recordedAudio}
            >
              {isAnalyzing ? 'AI Analyzing...' : 'AI Analyze'}
            </Button>
          </Space>
        }
      >
        {isAnalyzing ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>
              <LoadingOutlined spin style={{ color: '#ff6b6b' }} />
            </div>
            <div style={{ fontSize: '16px', color: '#ff6b6b', marginBottom: '8px' }}>
              🎤 AI is analyzing your voice...
            </div>
            <div style={{ color: '#666' }}>
              Transcribing speech and extracting accident information
            </div>
          </div>
        ) : (
          <div>
            <p style={{ marginBottom: '24px', textAlign: 'center' }}>
              Record your voice or upload an audio file describing the accident circumstances.
              Our AI will extract relevant information automatically.
            </p>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '24px', 
              marginBottom: '24px',
              padding: '20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px'
            }}>
              {/* Recording Section */}
              <div style={{ textAlign: 'center' }}>
                <Button
                  type={isRecording ? "primary" : "default"}
                  size="large"
                  icon={isRecording ? <StopOutlined /> : <PlayCircleOutlined />}
                  onClick={isRecording ? stopRecording : startRecording}
                  style={{ 
                    height: '60px',
                    minWidth: '120px',
                    marginBottom: '8px',
                    backgroundColor: isRecording ? '#ff4d4f' : undefined,
                    borderColor: isRecording ? '#ff4d4f' : undefined
                  }}
                >
                  {isRecording ? 'Stop' : 'Record'}
                </Button>
                {isRecording && (
                  <div style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                    🔴 {formatTime(recordingTime)}
                  </div>
                )}
                {recordedAudio && !isRecording && (
                  <div style={{ color: '#52c41a', fontSize: '12px' }}>
                    ✓ Recording ready
                  </div>
                )}
              </div>

              {/* Upload Section */}
              <div style={{ textAlign: 'center' }}>
                <Upload
                  accept="audio/*,.mp3,.wav"
                  beforeUpload={handleFileUpload}
                  showUploadList={false}
                  maxCount={1}
                >
                  <Button
                    size="large"
                    icon={<UploadOutlined />}
                    style={{ 
                      height: '60px',
                      minWidth: '120px',
                      marginBottom: '8px'
                    }}
                  >
                    Upload
                  </Button>
                </Upload>
                {audioFile && (
                  <div style={{ color: '#52c41a', fontSize: '12px' }}>
                    ✓ {audioFile.name}
                  </div>
                )}
              </div>
            </div>

            <div style={{ 
              padding: '12px', 
              backgroundColor: '#e6f7ff', 
              borderRadius: '6px',
              border: '1px solid #91d5ff'
            }}>
              <Text style={{ fontSize: '12px', color: '#1890ff' }}>
                💡 <strong>Tip:</strong> Describe the accident clearly including date, time, location, 
                what happened, vehicle details, and any other relevant circumstances.
              </Text>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

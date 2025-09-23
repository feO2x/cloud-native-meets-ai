'use client';

import '@ant-design/v5-patch-for-react-19';
import React from 'react';
import { Form, Input, DatePicker, Row, Col, Typography } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, CarOutlined } from '@ant-design/icons';
import { PersonalDataDto } from '../../types/damage-reports';
import { SmartPasteButton } from './SmartPasteButton';
import dayjs from 'dayjs';

const { Title } = Typography;

interface PersonalDataFormProps {
  data: PersonalDataDto;
  onDataChange: (data: PersonalDataDto) => void;
}

export const PersonalDataForm: React.FC<PersonalDataFormProps> = ({ data, onDataChange }) => {
  const handleFieldChange = (field: keyof PersonalDataDto, value: string) => {
    onDataChange({
      ...data,
      [field]: value
    });
  };

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      handleFieldChange('dateOfBirth', date.format('YYYY-MM-DD'));
    }
  };

  const handleAnalysisComplete = (analysisResult: Partial<PersonalDataDto>) => {
    // Merge the analysis result with existing data, only updating defined values
    const updatedData = { ...data };
    Object.entries(analysisResult).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        (updatedData as Record<string, unknown>)[key] = value;
      }
    });
    onDataChange(updatedData);
  };

  return (
    <div>
      <SmartPasteButton 
        onAnalysisComplete={handleAnalysisComplete}
        existingData={data}
      />
      
      <Title level={3} style={{ marginBottom: '24px' }}>
        <UserOutlined style={{ marginRight: '8px' }} />
        Personal Information
      </Title>
      
      <Form layout="vertical" size="large">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item 
              label="First Name" 
              required
              validateStatus={!data.firstName ? 'error' : ''}
              help={!data.firstName ? 'First name is required' : ''}
            >
              <Input
                placeholder="Enter your first name"
                value={data.firstName}
                onChange={(e) => handleFieldChange('firstName', e.target.value)}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item 
              label="Last Name" 
              required
              validateStatus={!data.lastName ? 'error' : ''}
              help={!data.lastName ? 'Last name is required' : ''}
            >
              <Input
                placeholder="Enter your last name"
                value={data.lastName}
                onChange={(e) => handleFieldChange('lastName', e.target.value)}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="Street Address">
              <Input
                placeholder="Enter your street address"
                value={data.street}
                onChange={(e) => handleFieldChange('street', e.target.value)}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="ZIP Code">
              <Input
                placeholder="ZIP Code"
                value={data.zipCode}
                onChange={(e) => handleFieldChange('zipCode', e.target.value)}
              />
            </Form.Item>
          </Col>
          <Col span={16}>
            <Form.Item label="City/Location">
              <Input
                placeholder="Enter city or location"
                value={data.location}
                onChange={(e) => handleFieldChange('location', e.target.value)}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item 
              label="Insurance ID" 
              required
              validateStatus={!data.insuranceId ? 'error' : ''}
              help={!data.insuranceId ? 'Insurance ID is required' : ''}
            >
              <Input
                placeholder="Enter your insurance ID"
                value={data.insuranceId}
                onChange={(e) => handleFieldChange('insuranceId', e.target.value)}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Date of Birth">
              <DatePicker
                style={{ width: '100%' }}
                placeholder="Select date of birth"
                value={data.dateOfBirth ? dayjs(data.dateOfBirth) : null}
                onChange={handleDateChange}
                disabledDate={(current) => current && current > dayjs()}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item 
              label="Phone Number" 
              required
              validateStatus={!data.telephone ? 'error' : ''}
              help={!data.telephone ? 'Phone number is required' : ''}
            >
              <Input
                prefix={<PhoneOutlined />}
                placeholder="Enter your phone number"
                value={data.telephone}
                onChange={(e) => handleFieldChange('telephone', e.target.value)}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item 
              label="Email Address" 
              required
              validateStatus={!data.email ? 'error' : ''}
              help={!data.email ? 'Email address is required' : ''}
            >
              <Input
                prefix={<MailOutlined />}
                type="email"
                placeholder="Enter your email address"
                value={data.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item 
              label="License Plate" 
              required
              validateStatus={!data.licensePlate ? 'error' : ''}
              help={!data.licensePlate ? 'License plate is required' : ''}
            >
              <Input
                prefix={<CarOutlined />}
                placeholder="Enter license plate number"
                value={data.licensePlate}
                onChange={(e) => handleFieldChange('licensePlate', e.target.value.toUpperCase())}
                style={{ textTransform: 'uppercase' }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

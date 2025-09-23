'use client';

import React from 'react';
import { Form, Select, Row, Col, Typography, Card, Divider } from 'antd';
import { CarOutlined } from '@ant-design/icons';
import { VehicleDamageDto, DamageType, PersonalDataDto, CircumstancesDto } from '../../types/damage-reports';
import { SmartImageButton } from './SmartImageButton';

const { Title, Text } = Typography;
const { Option } = Select;

interface VehicleDamageFormProps {
  data: VehicleDamageDto;
  onDataChange: (data: VehicleDamageDto) => void;
  personalData: PersonalDataDto;
  circumstances: CircumstancesDto;
}

const damageTypeOptions = [
  { value: DamageType.None, label: 'None', color: '#52c41a' },
  { value: DamageType.Scratch, label: 'Scratch', color: '#fa8c16' },
  { value: DamageType.Crack, label: 'Crack', color: '#f5222d' },
  { value: DamageType.Dent, label: 'Dent', color: '#ff4d4f' },
  { value: DamageType.Chip, label: 'Chip', color: '#faad14' },
  { value: DamageType.Hole, label: 'Hole', color: '#eb2f96' },
  { value: DamageType.Tear, label: 'Tear', color: '#f5222d' },
  { value: DamageType.Dislodgement, label: 'Dislodgement', color: '#722ed1' },
  { value: DamageType.Misalignment, label: 'Misalignment', color: '#13c2c2' }
];

const vehicleParts = [
  // Body Parts
  {
    category: 'Body & Structure',
    parts: [
      { key: 'frontBumper', label: 'Front Bumper' },
      { key: 'rearBumper', label: 'Rear Bumper' },
      { key: 'hood', label: 'Hood' },
      { key: 'trunkLid', label: 'Trunk Lid' },
      { key: 'roof', label: 'Roof' },
      { key: 'grille', label: 'Grille' }
    ]
  },
  // Doors
  {
    category: 'Doors',
    parts: [
      { key: 'frontLeftDoor', label: 'Front Left Door' },
      { key: 'frontRightDoor', label: 'Front Right Door' },
      { key: 'rearLeftDoor', label: 'Rear Left Door' },
      { key: 'rearRightDoor', label: 'Rear Right Door' }
    ]
  },
  // Fenders
  {
    category: 'Fenders',
    parts: [
      { key: 'frontLeftFender', label: 'Front Left Fender' },
      { key: 'frontRightFender', label: 'Front Right Fender' },
      { key: 'rearLeftFender', label: 'Rear Left Fender' },
      { key: 'rearRightFender', label: 'Rear Right Fender' }
    ]
  },
  // Lights
  {
    category: 'Lights',
    parts: [
      { key: 'leftHeadlights', label: 'Left Headlights' },
      { key: 'rightHeadlights', label: 'Right Headlights' },
      { key: 'leftTaillights', label: 'Left Taillights' },
      { key: 'rightTaillights', label: 'Right Taillights' }
    ]
  },
  // Mirrors
  {
    category: 'Mirrors',
    parts: [
      { key: 'leftSideMirror', label: 'Left Side Mirror' },
      { key: 'rightSideMirror', label: 'Right Side Mirror' }
    ]
  },
  // Windows & Glass
  {
    category: 'Windows & Glass',
    parts: [
      { key: 'windshield', label: 'Windshield' },
      { key: 'rearWindshield', label: 'Rear Windshield' },
      { key: 'frontLeftWindow', label: 'Front Left Window' },
      { key: 'frontRightWindow', label: 'Front Right Window' },
      { key: 'rearLeftWindow', label: 'Rear Left Window' },
      { key: 'rearRightWindow', label: 'Rear Right Window' }
    ]
  },
  // Wheels
  {
    category: 'Wheels',
    parts: [
      { key: 'frontLeftWheel', label: 'Front Left Wheel' },
      { key: 'frontRightWheel', label: 'Front Right Wheel' },
      { key: 'rearLeftWheel', label: 'Rear Left Wheel' },
      { key: 'rearRightWheel', label: 'Rear Right Wheel' }
    ]
  },
  // Trim
  {
    category: 'Exterior Trim',
    parts: [
      { key: 'leftExteriorTrim', label: 'Left Exterior Trim' },
      { key: 'rightExteriorTrim', label: 'Right Exterior Trim' }
    ]
  }
];

export const VehicleDamageForm: React.FC<VehicleDamageFormProps> = ({ data, onDataChange, personalData, circumstances }) => {
  const handleDamageChange = (partKey: keyof VehicleDamageDto, damageType: DamageType) => {
    onDataChange({
      ...data,
      [partKey]: damageType
    });
  };


  const handleImageAnalysisComplete = (analysisResult: Partial<VehicleDamageDto>) => {
    // Merge the analysis result with existing data, only updating defined values
    const updatedData = { ...data };
    Object.entries(analysisResult).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== DamageType.None) {
        (updatedData as Record<string, unknown>)[key] = value;
      }
    });
    onDataChange(updatedData);
  };

  // Count damaged parts for summary
  const damagedPartsCount = Object.values(data).filter(damage => damage !== DamageType.None).length;

  return (
    <div>
      <SmartImageButton 
        onAnalysisComplete={handleImageAnalysisComplete}
        existingPersonalData={personalData}
        existingCircumstances={circumstances}
      />
      
      <Title level={3} style={{ marginBottom: '24px' }}>
        <CarOutlined style={{ marginRight: '8px' }} />
        Vehicle Damage Assessment
      </Title>
      
      <div style={{ marginBottom: '24px', padding: '12px', backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: '6px' }}>
        <Text>
          <strong>Damaged Parts Summary:</strong> {damagedPartsCount} part(s) with damage reported
        </Text>
      </div>

      <Form layout="vertical">
        {vehicleParts.map((category, categoryIndex) => (
          <Card 
            key={categoryIndex}
            size="small" 
            title={category.category}
            style={{ marginBottom: '16px' }}
          >
            <Row gutter={[16, 16]}>
              {category.parts.map((part) => {
                const currentDamage = data[part.key as keyof VehicleDamageDto];
                return (
                  <Col key={part.key} xs={24} sm={12} md={8} lg={6}>
                    <Form.Item 
                      label={part.label}
                      style={{ marginBottom: 0 }}
                    >
                      <Select
                        value={currentDamage}
                        onChange={(value) => handleDamageChange(part.key as keyof VehicleDamageDto, value)}
                        style={{ width: '100%' }}
                      >
                        {damageTypeOptions.map(option => (
                          <Option key={option.value} value={option.value}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <div 
                                style={{
                                  width: '12px',
                                  height: '12px',
                                  borderRadius: '50%',
                                  backgroundColor: option.color,
                                  marginRight: '8px'
                                }}
                              />
                              {option.label}
                            </div>
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                );
              })}
            </Row>
          </Card>
        ))}
      </Form>

      <Divider />

      {/* Legend */}
      <Card size="small" title="Damage Type Legend">
        <Row gutter={[16, 8]}>
          {damageTypeOptions.map(option => (
            <Col key={option.value} xs={12} sm={8} md={6}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div 
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: option.color,
                    marginRight: '8px'
                  }}
                />
                <Text>{option.label}</Text>
              </div>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
};

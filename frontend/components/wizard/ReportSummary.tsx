'use client';

import React from 'react';
import { Typography, Alert, Descriptions, Tag, Badge, Row, Col, Card, Divider } from 'antd';
import { UserOutlined, CarOutlined, ExclamationCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { PersonalDataDto, CircumstancesDto, VehicleDamageDto, AccidentType, DamageType } from '../../types/damage-reports';

const { Title, Text } = Typography;

interface ReportSummaryProps {
  personalData: PersonalDataDto;
  circumstances: CircumstancesDto;
  vehicleDamage: VehicleDamageDto;
}

const getAccidentTypeColor = (accidentType: AccidentType): string => {
  switch (accidentType) {
    case AccidentType.BreakDown:
      return 'orange';
    case AccidentType.CarAccident:
      return 'red';
    case AccidentType.VehicleTheft:
      return 'purple';
    case AccidentType.SomethingElse:
      return 'blue';
    default:
      return 'default';
  }
};

const getDamageTypeColor = (damageType: DamageType): string => {
  switch (damageType) {
    case DamageType.None:
      return 'default';
    case DamageType.Scratch:
      return 'orange';
    case DamageType.Crack:
      return 'red';
    case DamageType.Dent:
      return 'volcano';
    case DamageType.Chip:
      return 'gold';
    case DamageType.Hole:
      return 'magenta';
    case DamageType.Tear:
      return 'red';
    case DamageType.Dislodgement:
      return 'purple';
    case DamageType.Misalignment:
      return 'cyan';
    default:
      return 'default';
  }
};

const formatPartName = (partName: string): string => {
  return partName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

export const ReportSummary: React.FC<ReportSummaryProps> = ({ personalData, circumstances, vehicleDamage }) => {
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get damaged parts for quick overview
  const damagedParts = Object.entries(vehicleDamage)
    .filter(([, damageType]) => damageType !== DamageType.None)
    .map(([partName, damageType]) => ({ partName, damageType }));

  // Validation checks
  const isPersonalDataComplete = personalData.firstName && personalData.lastName && 
                                personalData.email && personalData.telephone && 
                                personalData.licensePlate && personalData.insuranceId;
  
  const isCircumstancesComplete = circumstances.carType && circumstances.carColor && 
                                circumstances.reasonOfTravel;

  const isFormValid = isPersonalDataComplete && isCircumstancesComplete;

  return (
    <div>
      <Title level={3} style={{ marginBottom: '24px' }}>
        <CheckCircleOutlined style={{ marginRight: '8px' }} />
        Report Summary
      </Title>
      
      {!isFormValid && (
        <Alert
          message="Please complete all required fields"
          description="Review the previous steps and fill in all required information before submitting."
          type="warning"
          showIcon
          style={{ marginBottom: '24px' }}
        />
      )}

      {isFormValid && (
        <Alert
          message="Report Ready for Submission"
          description="Please review all information below and click 'Submit Report' to complete the process."
          type="success"
          showIcon
          style={{ marginBottom: '24px' }}
        />
      )}

      {/* Personal Data Section */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Title level={4}>
          <UserOutlined style={{ marginRight: 8 }} />
          Personal Information
        </Title>
        <Descriptions column={2} size="small">
          <Descriptions.Item label="Name">
            {personalData.firstName} {personalData.lastName}
          </Descriptions.Item>
          <Descriptions.Item label="Date of Birth">
            {formatDate(personalData.dateOfBirth)}
          </Descriptions.Item>
          <Descriptions.Item label="Address">
            {personalData.street ? 
              `${personalData.street}, ${personalData.zipCode} ${personalData.location}` : 
              'Not specified'
            }
          </Descriptions.Item>
          <Descriptions.Item label="License Plate">
            <Text code>{personalData.licensePlate}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Insurance ID">
            <Text code>{personalData.insuranceId}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Phone">
            {personalData.telephone}
          </Descriptions.Item>
          <Descriptions.Item label="Email" span={2}>
            {personalData.email}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Circumstances Section */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Title level={4}>
          <ExclamationCircleOutlined style={{ marginRight: 8 }} />
          Accident Circumstances
        </Title>
        <Descriptions column={2} size="small">
          <Descriptions.Item label="Date of Accident">
            {formatDateTime(circumstances.dateOfAccidentUtc)}
          </Descriptions.Item>
          <Descriptions.Item label="Accident Type">
            <Tag color={getAccidentTypeColor(circumstances.accidentType)}>
              {circumstances.accidentType.replace(/([A-Z])/g, ' $1').trim()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Country">
            {circumstances.countryCode}
          </Descriptions.Item>
          <Descriptions.Item label="Reason of Travel">
            {circumstances.reasonOfTravel}
          </Descriptions.Item>
          <Descriptions.Item label="Car Type">
            {circumstances.carType}
          </Descriptions.Item>
          <Descriptions.Item label="Car Color">
            {circumstances.carColor}
          </Descriptions.Item>
        </Descriptions>
        
        {circumstances.passengers.length > 0 && (
          <>
            <Divider />
            <Title level={5}>Passengers</Title>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {circumstances.passengers.map((passenger, index) => (
                <Tag key={index}>
                  {passenger.firstName} {passenger.lastName}
                </Tag>
              ))}
            </div>
          </>
        )}
        
        {circumstances.otherPartyContact && (
          <>
            <Divider />
            <Title level={5}>Other Party Contact</Title>
            <Text>
              {circumstances.otherPartyContact.firstName} {circumstances.otherPartyContact.lastName}
            </Text>
          </>
        )}
      </Card>

      {/* Vehicle Damage Section */}
      <Card size="small">
        <Title level={4}>
          <CarOutlined style={{ marginRight: 8 }} />
          Vehicle Damage Assessment
        </Title>
        
        {damagedParts.length > 0 ? (
          <>
            <div style={{ marginBottom: 16 }}>
              <Badge count={damagedParts.length} showZero={false}>
                <Text>Damaged Parts Summary</Text>
              </Badge>
            </div>
            
            <Row gutter={[16, 8]}>
              {damagedParts.map(({ partName, damageType }) => (
                <Col key={partName} span={12}>
                  <Card size="small" style={{ height: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text strong>{formatPartName(partName)}</Text>
                      <Tag color={getDamageTypeColor(damageType)}>{damageType}</Tag>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </>
        ) : (
          <div style={{ textAlign: 'center', color: '#999', padding: 32 }}>
            <CarOutlined style={{ fontSize: 32, marginBottom: 8 }} />
            <div>No vehicle damage reported</div>
          </div>
        )}
      </Card>
    </div>
  );
};

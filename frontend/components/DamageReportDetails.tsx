'use client';

import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Typography, Spin, Alert, Divider, Tag, Badge, Row, Col } from 'antd';
import { UserOutlined, CarOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { DamageReportDto, AccidentType, DamageType } from '../types/damage-reports';

const { Title, Text } = Typography;

interface DamageReportDetailsProps {
  reportId: string | null;
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

export const DamageReportDetails: React.FC<DamageReportDetailsProps> = ({ reportId }) => {
  const [report, setReport] = useState<DamageReportDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reportId) {
      setReport(null);
      return;
    }

    const fetchReport = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/damage-reports/${reportId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch report details: ${response.status} ${response.statusText}`);
        }
        
        const data: DamageReportDto = await response.json();
        setReport(data);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId]);

  if (!reportId) {
    return (
      <Card style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#999' }}>
          <CarOutlined style={{ fontSize: 48, marginBottom: 16 }} />
          <div>Select a damage report to view details</div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error Loading Report Details"
        description={error}
        type="error"
        showIcon
        style={{ margin: 16 }}
      />
    );
  }

  if (loading || !report) {
    return (
      <Card style={{ height: '100%' }}>
        <Spin size="large" style={{ display: 'block', textAlign: 'center', paddingTop: 100 }} />
      </Card>
    );
  }

  const formatDate = (dateString: string): string => {
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
  const damagedParts = Object.entries(report.vehicleDamage)
    .filter(([, damageType]) => damageType !== DamageType.None)
    .map(([partName, damageType]) => ({ partName, damageType }));

  return (
    <Card 
      title={`Report Details - ${report.personalData.firstName} ${report.personalData.lastName}`}
      style={{ height: '100%' }}
      styles={{
        body: { height: 'calc(100% - 57px)', overflow: 'auto' }
      }}
    >
      <div style={{ padding: '0 8px' }}>
        
        {/* Personal Data Section */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Title level={4}>
            <UserOutlined style={{ marginRight: 8 }} />
            Personal Information
          </Title>
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Name">
              {report.personalData.firstName} {report.personalData.lastName}
            </Descriptions.Item>
            <Descriptions.Item label="Date of Birth">
              {formatDate(report.personalData.dateOfBirth)}
            </Descriptions.Item>
            <Descriptions.Item label="Address">
              {report.personalData.street}, {report.personalData.zipCode} {report.personalData.location}
            </Descriptions.Item>
            <Descriptions.Item label="License Plate">
              <Text code>{report.personalData.licensePlate}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Insurance ID">
              <Text code>{report.personalData.insuranceId}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              {report.personalData.telephone}
            </Descriptions.Item>
            <Descriptions.Item label="Email" span={2}>
              {report.personalData.email}
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
              {formatDateTime(report.circumstances.dateOfAccidentUtc)}
            </Descriptions.Item>
            <Descriptions.Item label="Accident Type">
              <Tag color={getAccidentTypeColor(report.circumstances.accidentType)}>
                {report.circumstances.accidentType.replace(/([A-Z])/g, ' $1').trim()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Country">
              {report.circumstances.countryCode}
            </Descriptions.Item>
            <Descriptions.Item label="Reason of Travel">
              {report.circumstances.reasonOfTravel}
            </Descriptions.Item>
            <Descriptions.Item label="Car Type">
              {report.circumstances.carType}
            </Descriptions.Item>
            <Descriptions.Item label="Car Color">
              {report.circumstances.carColor}
            </Descriptions.Item>
          </Descriptions>
          
          {report.circumstances.passengers.length > 0 && (
            <>
              <Divider />
              <Title level={5}>Passengers</Title>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {report.circumstances.passengers.map((passenger, index) => (
                  <Tag key={index}>
                    {passenger.firstName} {passenger.lastName}
                  </Tag>
                ))}
              </div>
            </>
          )}
          
          {report.circumstances.otherPartyContact && (
            <>
              <Divider />
              <Title level={5}>Other Party Contact</Title>
              <Text>
                {report.circumstances.otherPartyContact.firstName} {report.circumstances.otherPartyContact.lastName}
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

        <Divider />
        <Text type="secondary" style={{ fontSize: 12 }}>
          Report created: {formatDateTime(report.createdAtUtc)} | ID: {report.id}
        </Text>
      </div>
    </Card>
  );
};

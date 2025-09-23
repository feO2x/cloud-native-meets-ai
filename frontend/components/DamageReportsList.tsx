'use client';

import React, { useState, useEffect } from 'react';
import { List, Badge, Card, Typography, Avatar, Spin, Alert, Pagination } from 'antd';
import { UserOutlined, CalendarOutlined } from '@ant-design/icons';
import { DamageReportListDto, AccidentType } from '../types/damage-reports';

const { Text } = Typography;

interface DamageReportsListProps {
  onSelectReport: (reportId: string) => void;
  selectedReportId: string | null;
}

const getAccidentTypeBadgeColor = (accidentType: AccidentType): string => {
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

const getAccidentTypeDisplayName = (accidentType: AccidentType): string => {
  switch (accidentType) {
    case AccidentType.BreakDown:
      return 'Break Down';
    case AccidentType.CarAccident:
      return 'Car Accident';
    case AccidentType.VehicleTheft:
      return 'Vehicle Theft';
    case AccidentType.SomethingElse:
      return 'Something Else';
    default:
      return accidentType;
  }
};

export const DamageReportsList: React.FC<DamageReportsListProps> = ({
  onSelectReport,
  selectedReportId
}) => {
  const [reports, setReports] = useState<DamageReportListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  const fetchReports = async (skip: number, take: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/damage-reports?skip=${skip}&take=${take}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch reports: ${response.status} ${response.statusText}`);
      }
      
      const data: DamageReportListDto[] = await response.json();
      setReports(data);
      
      // For now, we'll assume a large total count since the API doesn't return pagination info
      // In a real scenario, the API would return pagination metadata
      setTotal(data.length < take ? skip + data.length : skip + data.length + 1);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const skip = (currentPage - 1) * pageSize;
    fetchReports(skip, pageSize);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (error) {
    return (
      <Alert
        message="Error Loading Reports"
        description={error}
        type="error"
        showIcon
        style={{ margin: 16 }}
      />
    );
  }

  return (
    <Card 
      title="Damage Reports" 
      style={{ height: '100%' }}
      styles={{
        body: { padding: 0, height: 'calc(100% - 57px)', display: 'flex', flexDirection: 'column' }
      }}
    >
      <div style={{ flex: 1, overflow: 'auto' }}>
        <Spin spinning={loading}>
          <List
            dataSource={reports}
            renderItem={(report) => (
              <List.Item
                key={report.id}
                onClick={() => onSelectReport(report.id)}
                style={{
                  cursor: 'pointer',
                  backgroundColor: selectedReportId === report.id ? '#f0f8ff' : 'transparent',
                  borderLeft: selectedReportId === report.id ? '4px solid #1890ff' : '4px solid transparent',
                  padding: '16px 24px'
                }}
                className="damage-report-list-item"
              >
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} />}
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text strong>{`${report.firstName} ${report.lastName}`}</Text>
                      <Badge 
                        color={getAccidentTypeBadgeColor(report.accidentType)}
                        text={getAccidentTypeDisplayName(report.accidentType)}
                      />
                    </div>
                  }
                  description={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CalendarOutlined />
                      <Text type="secondary">
                        {formatDate(report.dateOfAccidentUtc)}
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Spin>
      </div>
      
      {total > pageSize && (
        <div style={{ padding: '16px', borderTop: '1px solid #f0f0f0' }}>
          <Pagination
            current={currentPage}
            total={total}
            pageSize={pageSize}
            onChange={handlePageChange}
            showSizeChanger={false}
            showQuickJumper
            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} reports`}
          />
        </div>
      )}
    </Card>
  );
};

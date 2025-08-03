'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Icon } from "@/components/ui/icon";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ProgressTracking() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Progress Tracking</h1>
          <p className="text-muted-foreground">
            Monitor migration progress and view detailed logs
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Icon icon="heroicons:arrow-path" className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Icon icon="heroicons:play" className="w-4 h-4 mr-2" />
            Start New Migration
          </Button>
        </div>
      </div>

      {/* Current Migration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Icon icon="heroicons:chart-bar" className="w-5 h-5 mr-2" />
            Current Migration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Progress Overview */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-muted-foreground">750/1000 records</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 border rounded-lg bg-green-50">
                  <div className="text-xl font-bold text-green-600">720</div>
                  <p className="text-xs text-muted-foreground">Successful</p>
                </div>
                <div className="text-center p-3 border rounded-lg bg-red-50">
                  <div className="text-xl font-bold text-red-600">30</div>
                  <p className="text-xs text-muted-foreground">Failed</p>
                </div>
              </div>
            </div>

            {/* Migration Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Batch ID</span>
                <span className="font-medium">BATCH_20241220_001</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Started</span>
                <span className="font-medium">Dec 20, 2024 10:30 AM</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge color="warning">In Progress</Badge>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">ETA</span>
                <span className="font-medium">~5 minutes</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Migration Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Icon icon="heroicons:document-text" className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,000</div>
            <p className="text-xs text-muted-foreground">In current batch</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Rate</CardTitle>
            <Icon icon="heroicons:bolt" className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">150/min</div>
            <p className="text-xs text-muted-foreground">Records per minute</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Icon icon="heroicons:check-circle" className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">96%</div>
            <p className="text-xs text-muted-foreground">720/750 successful</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
            <Icon icon="heroicons:x-circle" className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">30</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Migration History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Icon icon="heroicons:clock" className="w-5 h-5 mr-2" />
            Migration History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch ID</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Records</TableHead>
                <TableHead>Success Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">BATCH_20241220_001</TableCell>
                <TableCell>Dec 20, 2024 10:30 AM</TableCell>
                <TableCell>1,000</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Progress value={96} className="w-16 h-2 mr-2" />
                    <span className="text-sm">96%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge color="warning">In Progress</Badge>
                </TableCell>
                <TableCell>5m 30s</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm">
                      <Icon icon="heroicons:eye" className="w-3 h-3" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Icon icon="heroicons:stop" className="w-3 h-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">BATCH_20241219_003</TableCell>
                <TableCell>Dec 19, 2024 3:15 PM</TableCell>
                <TableCell>500</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Progress value={100} className="w-16 h-2 mr-2" />
                    <span className="text-sm">100%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge color="success">Completed</Badge>
                </TableCell>
                <TableCell>2m 45s</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm">
                      <Icon icon="heroicons:eye" className="w-3 h-3" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Icon icon="heroicons:arrow-down-tray" className="w-3 h-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">BATCH_20241219_002</TableCell>
                <TableCell>Dec 19, 2024 1:45 PM</TableCell>
                <TableCell>750</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Progress value={94} className="w-16 h-2 mr-2" />
                    <span className="text-sm">94%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge color="success">Completed</Badge>
                </TableCell>
                <TableCell>4m 12s</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm">
                      <Icon icon="heroicons:eye" className="w-3 h-3" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Icon icon="heroicons:arrow-down-tray" className="w-3 h-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Error Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Icon icon="heroicons:exclamation-triangle" className="w-5 h-5 mr-2 text-red-600" />
            Recent Errors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 border rounded-lg bg-red-50">
              <Icon icon="heroicons:x-circle" className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-medium">Validation Error - Row 245</p>
                  <span className="text-xs text-muted-foreground">10:35 AM</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Email format invalid: &apos;john.doe@invalid-domain&apos;. Skipped record.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 border rounded-lg bg-red-50">
              <Icon icon="heroicons:x-circle" className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-medium">Duplicate Entry - Row 189</p>
                  <span className="text-xs text-muted-foreground">10:33 AM</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Email &apos;jane@example.com&apos; already exists in database. Skipped record.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 border rounded-lg bg-orange-50">
              <Icon icon="heroicons:exclamation-triangle" className="w-5 h-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-medium">Data Truncated - Row 156</p>
                  <span className="text-xs text-muted-foreground">10:31 AM</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Phone number too long, truncated to 20 characters. Record saved with warning.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
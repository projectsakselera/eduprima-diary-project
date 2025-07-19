import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Business Affair - Eduprima Admin",
  description: "Business affair management for Eduprima Learning Management System",
};

export default function BusinessAffairPage() {
  const partnerships = [
    {
      id: 1,
      name: "TechCorp Solutions",
      type: "Technology Partner",
      status: "active",
      value: "$50,000",
      startDate: "2024-01-15",
    },
    {
      id: 2,
      name: "EduTech Innovations",
      type: "Educational Partner",
      status: "pending",
      value: "$25,000",
      startDate: "2024-03-01",
    },
    {
      id: 3,
      name: "Global Learning Systems",
      type: "Platform Partner",
      status: "active",
      value: "$75,000",
      startDate: "2023-11-20",
    },
  ]

  const marketingCampaigns = [
    {
      id: 1,
      name: "Summer Enrollment Drive",
      channel: "Digital Marketing",
      budget: "$15,000",
      status: "running",
      leads: 245,
    },
    {
      id: 2,
      name: "Corporate Training Promotion",
      channel: "B2B Marketing",
      budget: "$8,000",
      status: "completed",
      leads: 89,
    },
    {
      id: 3,
      name: "Student Referral Program",
      channel: "Social Media",
      budget: "$5,000",
      status: "planned",
      leads: 0,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Business Affairs</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage partnerships, marketing, and business relationships
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
            New Partnership
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            New Campaign
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Partnerships</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">8</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400 text-lg">🤝</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Value</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">$2.4M</p>
            </div>
            <div className="h-8 w-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <span className="text-green-600 dark:text-green-400 text-lg">💰</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Campaigns</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">3</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 dark:text-purple-400 text-lg">📢</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Leads</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">1,234</p>
            </div>
            <div className="h-8 w-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <span className="text-orange-600 dark:text-orange-400 text-lg">👥</span>
            </div>
          </div>
        </div>
      </div>

      {/* Partnerships */}
      <div className="rounded-lg border bg-card">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span>🤝</span>
            Strategic Partnerships
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {partnerships.map((partnership) => (
              <div
                key={partnership.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <span className="text-blue-600 dark:text-blue-400 text-lg">🏢</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {partnership.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {partnership.type}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Value: {partnership.value}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Started: {partnership.startDate}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    partnership.status === 'active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                  }`}>
                    {partnership.status}
                  </span>
                  <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Marketing Campaigns */}
      <div className="rounded-lg border bg-card">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span>📢</span>
            Marketing Campaigns
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {marketingCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <span className="text-purple-600 dark:text-purple-400 text-lg">📈</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {campaign.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {campaign.channel}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Budget: {campaign.budget}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Leads: {campaign.leads}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    campaign.status === 'running' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : campaign.status === 'completed'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                  }`}>
                    {campaign.status}
                  </span>
                  <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                    Manage
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 
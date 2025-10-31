import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Profile() {
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    memberSince: 'January 2024',
    totalEsims: 5,
    activeEsims: 2,
  };

  const activeEsims = [
    {
      id: 1,
      country: '🇺🇸 United States',
      data: '10GB',
      used: '3.2GB',
      expiry: '2024-12-15',
      status: 'active',
    },
    {
      id: 2,
      country: '🇬🇧 United Kingdom',
      data: '15GB',
      used: '8.5GB',
      expiry: '2024-12-20',
      status: 'active',
    },
  ];

  const recentOrders = [
    {
      id: 1,
      country: '🇯🇵 Japan',
      date: '2024-10-15',
      price: '$34.99',
      status: 'completed',
    },
    {
      id: 2,
      country: '🇫🇷 France',
      date: '2024-09-20',
      price: '$22.99',
      status: 'completed',
    },
  ];

  return (
    <ProtectedRoute>
      <div className="py-20 md:py-28 bg-linear-to-b from-white via-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-12 bg-linear-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              My Profile
            </h1>

          {/* Profile Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            <Card className="lg:col-span-2">
              <h2 className="text-3xl font-bold mb-6 text-slate-900">Account Information</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b">
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="text-lg font-medium">{user.name}</p>
                  </div>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
                <div className="flex items-center justify-between pb-4 border-b">
                  <div>
                    <p className="text-sm text-gray-600">Email Address</p>
                    <p className="text-lg font-medium">{user.email}</p>
                  </div>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Password</p>
                    <p className="text-lg font-medium">••••••••</p>
                  </div>
                  <Button variant="outline" size="sm">Change</Button>
                </div>
              </div>
            </Card>

            <div className="space-y-6">
              <Card hover className="group">
                <p className="text-sm text-slate-600 mb-2 font-semibold">Member Since</p>
                <p className="text-3xl font-extrabold text-slate-900">{user.memberSince}</p>
              </Card>
              <Card hover className="group">
                <p className="text-sm text-slate-600 mb-2 font-semibold">Total eSIMs Purchased</p>
                <p className="text-3xl font-extrabold text-slate-900">{user.totalEsims}</p>
              </Card>
              <Card hover className="group">
                <p className="text-sm text-slate-600 mb-2 font-semibold">Active eSIMs</p>
                <p className="text-3xl font-extrabold bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{user.activeEsims}</p>
              </Card>
            </div>
          </div>

          {/* Active eSIMs */}
          <Card className="mb-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-slate-900">Active eSIMs</h2>
              <Button variant="outline" size="sm">View All</Button>
            </div>
            {activeEsims.length > 0 ? (
              <div className="space-y-4">
                {activeEsims.map((esim) => (
                  <div
                    key={esim.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">{esim.country}</h3>
                      <p className="text-sm text-gray-600">
                        {esim.used} / {esim.data} used
                      </p>
                    </div>
                    <div className="text-right mr-4">
                      <p className="text-sm text-gray-600">Expires</p>
                      <p className="font-medium">{esim.expiry}</p>
                    </div>
                    <Button size="sm">Manage</Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No active eSIMs</p>
            )}
          </Card>

          {/* Recent Orders */}
          <Card>
            <h2 className="text-3xl font-bold mb-8 text-slate-900">Recent Orders</h2>
            {recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 text-sm font-semibold">Country</th>
                      <th className="text-left py-3 px-2 text-sm font-semibold">Date</th>
                      <th className="text-left py-3 px-2 text-sm font-semibold">Price</th>
                      <th className="text-left py-3 px-2 text-sm font-semibold">Status</th>
                      <th className="text-left py-3 px-2 text-sm font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="border-b">
                        <td className="py-4 px-2">{order.country}</td>
                        <td className="py-4 px-2 text-gray-600">{order.date}</td>
                        <td className="py-4 px-2 font-semibold">{order.price}</td>
                        <td className="py-4 px-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4 px-2">
                          <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600">No orders yet</p>
            )}
          </Card>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}



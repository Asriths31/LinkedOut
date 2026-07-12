import React from 'react';
import { useAuthStore } from '../../../store/authStore';
import { ShieldAlert, Users, Building2, Briefcase, CheckCircle, Ban } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore();

  const mockUsersList = [
    { id: '1', name: 'Jane Candidate', email: 'candidate@hirewave.dev', role: 'Candidate', isVerified: true },
    { id: '2', name: 'John Recruiter', email: 'employer@hirewave.dev', role: 'Employer', isVerified: true },
    { id: '3', name: 'Alex Admin', email: 'admin@hirewave.dev', role: 'Admin', isVerified: true },
  ];

  const handleBlockUser = (name: string) => {
    toast.success(`Access permissions updated for ${name}`);
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 lg:px-6 py-8">
      {/* Page Header */}
      <div className="border-b border-border-default pb-6 mb-6">
        <h1 className="text-2xl font-semibold text-fg-default flex items-center gap-2 mb-1">
          <ShieldAlert className="text-primary" size={22} />
          Admin Platform Control
        </h1>
        <p className="text-sm text-fg-muted">Welcome, Administrator ({user?.name || 'Alex'})</p>
      </div>

      {/* Analytics stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="border border-border-default rounded-md bg-canvas-subtle p-4 flex items-center gap-3">
          <div className="p-2 bg-white border border-border-default rounded-md text-primary">
            <Users size={18} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-fg-default">3</h3>
            <p className="text-xs text-fg-muted">Total Users</p>
          </div>
        </div>

        <div className="border border-border-default rounded-md bg-canvas-subtle p-4 flex items-center gap-3">
          <div className="p-2 bg-white border border-border-default rounded-md text-fg-default">
            <Building2 size={18} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-fg-default">1</h3>
            <p className="text-xs text-fg-muted">Verified Companies</p>
          </div>
        </div>

        <div className="border border-border-default rounded-md bg-canvas-subtle p-4 flex items-center gap-3">
          <div className="p-2 bg-white border border-border-default rounded-md text-fg-default">
            <Briefcase size={18} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-fg-default">3</h3>
            <p className="text-xs text-fg-muted">Active Listings</p>
          </div>
        </div>
      </div>

      {/* User control grid */}
      <div className="border border-border-default rounded-md bg-white">
        <div className="px-4 py-3 border-b border-border-default bg-canvas-subtle rounded-t-md">
          <h2 className="text-sm font-semibold text-fg-default">User Registry Management</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-fg-muted">
            <thead className="bg-canvas-subtle text-xs font-semibold text-fg-subtle uppercase tracking-wider border-b border-border-default">
              <tr>
                <th className="px-6 py-3">User Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Account Type</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {mockUsersList.map((usr) => (
                <tr key={usr.id} className="hover:bg-canvas-subtle">
                  <td className="px-6 py-3 font-semibold text-fg-default">{usr.name}</td>
                  <td className="px-6 py-3">{usr.email}</td>
                  <td className="px-6 py-3 font-semibold text-primary">{usr.role}</td>
                  <td className="px-6 py-3">
                    <span className="flex items-center gap-1 text-success font-semibold">
                      <CheckCircle size={14} />
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => handleBlockUser(usr.name)}
                      className="p-1.5 rounded-md border border-border-default text-fg-subtle hover:text-danger hover:bg-danger-light transition-colors"
                      title="Toggle Lock"
                    >
                      <Ban size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;

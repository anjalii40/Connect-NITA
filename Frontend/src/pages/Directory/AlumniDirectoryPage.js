import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const AlumniDirectoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [alumni, setAlumni] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch alumni data
  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        const response = await axios.get('/api/users/alumni-directory');
        setAlumni(response.data.alumni || []);
      } catch (error) {
        console.error('Error fetching alumni:', error);
        setError('Failed to load alumni directory');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlumni();
  }, []);

  const filteredAlumni = alumni.filter(alum => {
    const matchesSearch = `${alum.firstName} ${alum.lastName} ${alum.company} ${alum.position}`.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Alumni Directory
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Connect with fellow alumni from top-tier colleges across India
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search alumni by name, company, or position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
          <div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Alumni</option>
              <option value="recent">Recent Graduates</option>
              <option value="senior">Senior Positions</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alumni Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAlumni.map((alum) => (
          <div key={alum.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center space-x-4">
              <img
                className="h-16 w-16 rounded-full"
                src={alum.profileImage || `https://ui-avatars.com/api/?name=${alum.firstName}+${alum.lastName}&background=random`}
                alt=""
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {alum.firstName} {alum.lastName}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {alum.position}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  {alum.company}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  {alum.location}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-400">
                  {alum.college?.name} • {alum.branch}
                </p>
              </div>
            </div>
            <div className="mt-4 flex space-x-2">
              <Link
                to={`/profile/${alum.id}`}
                className="flex-1 text-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                View Profile
              </Link>
              <button className="flex-1 text-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-500 dark:text-gray-400">
                Message
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredAlumni.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No alumni found matching your search criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default AlumniDirectoryPage; 
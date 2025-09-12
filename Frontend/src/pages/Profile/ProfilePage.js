import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Check if viewing own profile or someone else's
  const isOwnProfile = !id || id === user?.id;
  const displayUser = isOwnProfile ? user : profileUser;
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      firstName: displayUser?.firstName || '',
      lastName: displayUser?.lastName || '',
      email: displayUser?.email || '',
      bio: displayUser?.bio || '',
      location: displayUser?.location || '',
      company: displayUser?.company || '',
      position: displayUser?.position || '',
    },
  });

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (isOwnProfile) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`/api/users/profile/${id}`);
        setProfileUser(response.data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Failed to load user profile');
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [id, isOwnProfile, navigate]);

  // Update form when displayUser changes
  useEffect(() => {
    if (displayUser) {
      reset({
        firstName: displayUser.firstName || '',
        lastName: displayUser.lastName || '',
        email: displayUser.email || '',
        bio: displayUser.bio || '',
        location: displayUser.location || '',
        company: displayUser.company || '',
        position: displayUser.position || '',
      });
    }
  }, [displayUser, reset]);

  const onSubmit = async (data) => {
    if (!isOwnProfile) {
      toast.error('You can only edit your own profile');
      return;
    }

    setIsUpdating(true);
    try {
      await updateProfile(data);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEdit = () => {
    if (!isOwnProfile) {
      toast.error('You can only edit your own profile');
      return;
    }
    setIsEditing(true);
    reset({
      firstName: displayUser?.firstName || '',
      lastName: displayUser?.lastName || '',
      email: displayUser?.email || '',
      bio: displayUser?.bio || '',
      location: displayUser?.location || '',
      company: displayUser?.company || '',
      position: displayUser?.position || '',
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!displayUser) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          User not found.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-8">
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              <img
                className="h-24 w-24 rounded-full"
                src={displayUser?.profileImage || `https://ui-avatars.com/api/?name=${displayUser?.firstName}+${displayUser?.lastName}&background=random`}
                alt=""
              />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {displayUser?.firstName} {displayUser?.lastName}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {displayUser?.position} {displayUser?.company && `at ${displayUser.company}`}
              </p>
              <p className="text-gray-500 dark:text-gray-500">
                {displayUser?.location}
              </p>
              {!isOwnProfile && (
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  {displayUser?.college?.name} • {displayUser?.branch}
                </p>
              )}
            </div>
            <div>
              {!isEditing && isOwnProfile && (
                <Button onClick={handleEdit}>
                  Edit Profile
                </Button>
              )}
              {!isOwnProfile && (
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    Message
                  </Button>
                  <Button variant="outline" className="w-full">
                    Connect
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-8">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
            Profile Information
          </h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="First name"
                  type="text"
                  {...register('firstName', {
                    required: 'First name is required',
                  })}
                  error={errors.firstName?.message}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Input
                  label="Last name"
                  type="text"
                  {...register('lastName', {
                    required: 'Last name is required',
                  })}
                  error={errors.lastName?.message}
                  disabled={!isEditing}
                />
              </div>
            </div>
            
            <div>
              <Input
                label="Email"
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                error={errors.email?.message}
                disabled={!isEditing}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                {...register('bio')}
                rows={4}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  !isEditing
                    ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
                    : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
                disabled={!isEditing}
                placeholder="Tell us about yourself..."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Location"
                  type="text"
                  {...register('location')}
                  disabled={!isEditing}
                  placeholder="City, Country"
                />
              </div>
              <div>
                <Input
                  label="Company"
                  type="text"
                  {...register('company')}
                  disabled={!isEditing}
                  placeholder="Your company"
                />
              </div>
            </div>
            
            <div>
              <Input
                label="Position"
                type="text"
                {...register('position')}
                disabled={!isEditing}
                placeholder="Your job title"
              />
            </div>

            {isEditing && isOwnProfile && (
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <div className="flex items-center">
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Saving...</span>
                    </div>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 
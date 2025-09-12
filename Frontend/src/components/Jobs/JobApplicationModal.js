import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import Button from '../UI/Button';
import Input from '../UI/Input';
import LoadingSpinner from '../UI/LoadingSpinner';

const JobApplicationModal = ({ job, isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [showReferralForm, setShowReferralForm] = useState(false);
  const [referralMessage, setReferralMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm();

  const isStudent = user?.userType === 'student';
  const hasCodingProfile = watch('leetcodeProfile') || watch('hackerrankProfile') || watch('codechefProfile') || watch('githubProfile');
  const hasAchievements = watch('achievements');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size should be less than 5MB');
        return;
      }
      if (!file.type.includes('pdf') && !file.type.includes('doc')) {
        toast.error('Please upload a PDF or DOC file');
        return;
      }
      setResumeFile(file);
    }
  };

  const generateReferralMessage = () => {
    let message = `Hi, I'm ${user?.firstName} ${user?.lastName}, a student from ${user?.college?.name} (${user?.branch}). `;
    
    if (hasCodingProfile) {
      const profiles = [];
      if (watch('leetcodeProfile')) profiles.push('LeetCode');
      if (watch('hackerrankProfile')) profiles.push('HackerRank');
      if (watch('codechefProfile')) profiles.push('CodeChef');
      if (watch('githubProfile')) profiles.push('GitHub');
      message += `I have a strong coding background with profiles on ${profiles.join(', ')}. `;
    }
    
    if (hasAchievements) {
      message += `Some of my major achievements include: ${watch('achievements')}. `;
    }
    
    message += `I'm very interested in the ${job.title} position at ${job.company} and would greatly appreciate your referral. `;
    message += `I've attached my resume for your review. Thank you for your time and consideration!`;
    
    return message;
  };

  const onSubmit = async (data) => {
    if (isStudent && !resumeFile) {
      toast.error('Please upload your resume');
      return;
    }

    setIsLoading(true);
    try {
      // Upload resume if provided
      let resumeUrl = null;
      if (resumeFile) {
        const formData = new FormData();
        formData.append('resume', resumeFile);
        
        const uploadResponse = await axios.post('/api/users/profile/resume', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        resumeUrl = uploadResponse.data.resumeUrl;
      }

      // Prepare application data
      const applicationData = {
        jobId: job.id,
        coverLetter: data.coverLetter,
        resumeUrl,
        codingProfile: data.codingProfile,
        achievements: data.achievements,
        referralMessage: showReferralForm ? referralMessage : null,
      };

      // Submit application
      const response = await axios.post(`/api/jobs/${job.id}/apply`, applicationData);
      
      toast.success('Application submitted successfully!');
      onSuccess && onSuccess(response.data);
      onClose();
    } catch (error) {
      console.error('Application error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Apply for {job.title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Job Details */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                {job.title} at {job.company}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {job.location} • {job.type} • {job.salary}
              </p>
            </div>

            {/* Cover Letter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cover Letter *
              </label>
              <textarea
                {...register('coverLetter', { required: 'Cover letter is required' })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Tell us why you're interested in this position and why you'd be a great fit..."
              />
              {errors.coverLetter && (
                <p className="text-red-500 text-sm mt-1">{errors.coverLetter.message}</p>
              )}
            </div>

            {/* Resume Upload (for students) */}
            {isStudent && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Resume *
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Upload your resume (PDF, DOC, DOCX) - Max 5MB
                  </p>
                  {resumeFile && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                      ✓ {resumeFile.name} selected
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Coding Profile Links */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Coding Profile Links (Optional)
              </label>
              <div className="space-y-3">
                <div>
                  <Input
                    type="url"
                    placeholder="LeetCode Profile URL"
                    {...register('leetcodeProfile')}
                  />
                </div>
                <div>
                  <Input
                    type="url"
                    placeholder="HackerRank Profile URL"
                    {...register('hackerrankProfile')}
                  />
                </div>
                <div>
                  <Input
                    type="url"
                    placeholder="CodeChef Profile URL"
                    {...register('codechefProfile')}
                  />
                </div>
                <div>
                  <Input
                    type="url"
                    placeholder="GitHub Profile URL"
                    {...register('githubProfile')}
                  />
                </div>
              </div>
            </div>

            {/* Major Achievements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Major Achievements (Optional)
              </label>
              <textarea
                {...register('achievements')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="List your major achievements, awards, certifications, or notable projects..."
              />
            </div>

            {/* Referral Request */}
            {isStudent && (
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Request Alumni Referral
                  </h3>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showReferralForm}
                      onChange={(e) => setShowReferralForm(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Request referral
                    </span>
                  </label>
                </div>

                {showReferralForm && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Referral Message
                      </label>
                      <textarea
                        value={referralMessage}
                        onChange={(e) => setReferralMessage(e.target.value)}
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Write a personalized message to request a referral..."
                      />
                    </div>
                    
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                        Suggested Message:
                      </h4>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        {generateReferralMessage()}
                      </p>
                      <button
                        type="button"
                        onClick={() => setReferralMessage(generateReferralMessage())}
                        className="text-blue-600 dark:text-blue-400 text-sm mt-2 hover:underline"
                      >
                        Use suggested message
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Submitting...</span>
                  </div>
                ) : (
                  'Submit Application'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobApplicationModal; 
import React from 'react';
import PropTypes from 'prop-types';
import EditIcon from './icons/EditIcon';
import DeleteIcon from './icons/DeleteIcon';
import { EyeIcon } from './icons/EyeIcons';

const MAX_VISIBLE_DISTRICTS = 5;
const DISTRICT_ROW_HEIGHT_PX = 72;

const RecordsList = ({
  viewTab,
  previousSubmissions,
  districtForm,
  onViewSubmission,
  onEditDistrict,
  onDeleteDistrict,
  onViewDistrict,
  onSubmitRecord,
  onLogout,
}) => {
  const districtsCount = districtForm.data?.districts?.length || 0;

  return (
    <div className="nafra-form-data-collected">
      {viewTab === 'submissions' && (
        <>
          <div className="nafra-form-data-collected-header">
            <span>Previous Submissions</span>
            <span className="actions-title">Actions</span>
          </div>
          <ul
            className="nafra-form-data-collected-body"
            style={
              previousSubmissions.length > MAX_VISIBLE_DISTRICTS
                ? {
                  maxHeight: `${MAX_VISIBLE_DISTRICTS * DISTRICT_ROW_HEIGHT_PX}px`,
                  overflowY: 'auto',
                  paddingRight: '4px',
                }
                : undefined
            }
          >
            {previousSubmissions.length > 0 ? (
              previousSubmissions.map((submission) => (
                <li key={submission.id} className="submission-row">
                  <span className="submission-date">
                    Submitted on
                    {' '}
                    {new Date(submission.submissionDate).toLocaleDateString()}
                  </span>
                  <div className="submission-actions">
                    <button
                      className="btn-a-icon"
                      type="button"
                      title="View Submission"
                      onClick={() => onViewSubmission(submission)}
                    >
                      <EyeIcon className="view-icon" />
                    </button>
                  </div>
                </li>
              ))
            ) : (
              <li className="no-submissions">No previous submissions found</li>
            )}
          </ul>
        </>
      )}

      {viewTab === 'active' && (
        <>
          <div className="nafra-form-data-collected-header">
            <span>Districts Record</span>
            <span className="actions-title">Actions</span>
          </div>
          <ul
            className="nafra-form-data-collected-body"
            style={
              districtsCount > MAX_VISIBLE_DISTRICTS
                ? {
                  maxHeight: `${MAX_VISIBLE_DISTRICTS * DISTRICT_ROW_HEIGHT_PX}px`,
                  overflowY: 'auto',
                  paddingRight: '4px',
                }
                : undefined
            }
          >
            {districtsCount > 0 ? (
              districtForm.data.districts.map((district) => (
                <li key={district.id} className="district-row">
                  <span className="district-name">{district.name}</span>
                  <div className="district-actions">
                    <button
                      className="btn-a-icon"
                      type="button"
                      title="Edit"
                      onClick={() => onEditDistrict(district)}
                    >
                      <EditIcon className="edit-icon" />
                    </button>
                    <button
                      className="btn-a-icon"
                      type="button"
                      title="Delete"
                      onClick={() => onDeleteDistrict(district)}
                    >
                      <DeleteIcon className="delete-icon" />
                    </button>
                    <button
                      className="btn-a-icon"
                      type="button"
                      title="Preview"
                      onClick={() => onViewDistrict(district)}
                    >
                      <EyeIcon className="view-icon" />
                    </button>
                  </div>
                </li>
              ))
            ) : (
              <li className="no-submissions">No districts added yet. Click &quot;+ Add District&quot; to start.</li>
            )}
          </ul>

          <div className="form-view-buttons">
            {districtsCount > 0 && (
              <button
                className="submit-button"
                type="button"
                onClick={onSubmitRecord}
              >
                Submit Record
              </button>
            )}
            <button className="login-prev" type="button" onClick={onLogout}>
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

RecordsList.propTypes = {
  viewTab: PropTypes.string.isRequired,
  previousSubmissions: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    submissionDate: PropTypes.string.isRequired,
  })).isRequired,
  districtForm: PropTypes.shape({
    data: PropTypes.shape({
      districts: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        name: PropTypes.string.isRequired,
      })),
    }),
  }).isRequired,
  onViewSubmission: PropTypes.func.isRequired,
  onEditDistrict: PropTypes.func.isRequired,
  onDeleteDistrict: PropTypes.func.isRequired,
  onViewDistrict: PropTypes.func.isRequired,
  onSubmitRecord: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
};

export default RecordsList;

import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeDistrict, saveDraft, triggerSuccessMessage } from '../features/draft/draftSlice';
import { logOut } from '../features/auth/authSlice';
import './styles/DistrictDeleteModal.css';

const DistrictDeleteModal = ({ district = null, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const districtForm = useSelector((state) => state.draft.districtForm);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(logOut());
      navigate('/login');
    }
  }, [isAuthenticated, dispatch, navigate]);

  if (!isAuthenticated || !district) {
    return null;
  }

  const handleDelete = () => {
    setError('');
    setIsDeleting(true);

    // 1. Prepare data for backend
    const updatedDistricts = districtForm.data.districts.filter((d) => d.id !== district.id);

    const draftData = {
      title: districtForm.title || `Draft - ${new Date().toLocaleDateString()}`,
      data: {
        ...districtForm.data,
        districts: updatedDistricts,
      },
      status: 'draft',
    };

    // 2. Persist to backend first
    dispatch(saveDraft({ draftData, draftId: districtForm.id }))
      .unwrap()
      .then(() => {
        // 3. Update local state ONLY on success
        dispatch(removeDistrict(district.id));
        dispatch(triggerSuccessMessage());
        onClose();
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Failed to delete district:', err);
        setError(err.message || 'Failed to delete district. Please try again.');
      })
      .finally(() => {
        setIsDeleting(false);
      });
  };

  return (
    <div className="modal-overlay">
      <div className="district-delete-modal">
        <div className="modal-header">
          <h2>Delete District</h2>
          <button type="button" className="close-modal-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-content">
          <div className="delete-warning">
            <div className="warning-icon">⚠️</div>
            <h3>Are you sure you want to delete this district?</h3>
            <p className="district-name">{district.name}</p>
            <p className="warning-text">
              This action cannot be undone. All data associated with this district,
              including chiefdoms and fertilizer information, will be permanently deleted.
            </p>

            {district.chiefdoms && district.chiefdoms.length > 0 && (
              <div className="affected-data">
                <h4>This will delete:</h4>
                <ul>
                  <li>
                    {district.chiefdoms.length}
                    {' '}
                    chiefdom(s)
                  </li>
                  <li>
                    {district.chiefdoms.reduce(
                      (total, chiefdom) => total + (chiefdom.fertilizers?.length || 0),
                      0,
                    )}
                    {' '}
                    fertilizer record(s)
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
        {error && (
          <p
            className="modal-error"
            style={{
              color: '#d32f2f', padding: '0 24px', margin: '-8px 0 16px', fontSize: '14px',
            }}
          >
            {error}
          </p>
        )}
        <div className="modal-footer">
          <button type="button" className="secondary-btn" onClick={onClose} disabled={isDeleting}>
            Cancel
          </button>
          <button type="button" className="danger-btn" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete District'}
          </button>
        </div>
      </div>
    </div>
  );
};

DistrictDeleteModal.propTypes = {
  district: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    chiefdoms: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        customName: PropTypes.string,
        fertilizers: PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.string,
            name: PropTypes.string,
            customName: PropTypes.string,
            dealership: PropTypes.string,
            bagCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            bagSize: PropTypes.string,
          }),
        ),
      }),
    ),
  }),
  onClose: PropTypes.func.isRequired,
};

DistrictDeleteModal.defaultProps = {
  district: null,
};

export default DistrictDeleteModal;

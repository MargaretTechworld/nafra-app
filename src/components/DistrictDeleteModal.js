import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { deleteDistrict } from '../features/district/districtSlice';
import { logout } from '../features/auth/authSlice';
import './styles/DistrictDeleteModal.css';

const DistrictDeleteModal = ({ district, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(logout());
      navigate('/login');
    }
  }, [isAuthenticated, dispatch, navigate]);

  if (!isAuthenticated || !district) {
    return null;
  }

  const handleDelete = () => {
    dispatch(deleteDistrict(district.id));
    onClose();
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

        <div className="modal-footer">
          <button type="button" className="secondary-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="danger-btn" onClick={handleDelete}>
            Delete District
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

import PropTypes from 'prop-types';
import './styles/DistrictViewModal.css';

const DistrictViewModal = ({ district, onClose }) => {
  if (!district) return null;

  return (
    <div className="modal-overlay">
      <div className="district-view-modal">
        <div className="modal-header">
          <h2>District Details</h2>
          <button type="button" className="close-modal-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-content">
          <div className="district-info">
            <h3>{district.name}</h3>

            {district.chiefdoms && district.chiefdoms.length > 0 ? (
              <div className="chiefdoms-list">
                <h4>
                  Chiefdoms (
                  {district.chiefdoms.length}
                  )
                </h4>
                {district.chiefdoms.map((chiefdom) => (
                  <div key={chiefdom.id} className="chiefdom-card">
                    <div className="chiefdom-header">
                      <h5>{chiefdom.name || chiefdom.customName}</h5>
                      <span className="dealership">{chiefdom.dealership}</span>
                    </div>

                    {chiefdom.fertilizers && chiefdom.fertilizers.length > 0 ? (
                      <div className="fertilizers-list">
                        <h6>
                          Fertilizers (
                          {chiefdom.fertilizers.length}
                          )
                        </h6>
                        {chiefdom.fertilizers.map((fertilizer) => (
                          <div key={fertilizer.id} className="fertilizer-item">
                            <span className="fertilizer-name">
                              {fertilizer.name || fertilizer.customName}
                            </span>
                            <span className="fertilizer-details">
                              {fertilizer.bagCount}
                              {' '}
                              of
                              {fertilizer.bagSize}
                              kg bags
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-fertilizers">No fertilizers added</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-chiefdoms">No chiefdoms added</p>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="primary-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

DistrictViewModal.propTypes = {
  district: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    chiefdoms: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string,
        customName: PropTypes.string,
        dealership: PropTypes.string,
        fertilizers: PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string,
            customName: PropTypes.string,
            bagCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            bagSize: PropTypes.string,
          }),
        ),
      }),
    ),
  }),
  onClose: PropTypes.func.isRequired,
};

DistrictViewModal.defaultProps = {
  district: null,
};

export default DistrictViewModal;

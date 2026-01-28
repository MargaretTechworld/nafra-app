import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logOut } from '../features/auth/authSlice';
import './styles/DistrictViewModal.css';

const DistrictViewModal = ({ district, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(logOut());
      navigate('/login');
    }
  }, [isAuthenticated, dispatch, navigate]);

  const handleDownloadPDF = (districtData) => {
    let content = `
${districtData.isSubmission ? 'SUBMISSION REPORT' : 'DISTRICT REPORT'}
=====================================

Name: ${districtData.name}
${districtData.isSubmission ? `Submission Date: ${new Date(districtData.submissionDate).toLocaleDateString()}` : ''}
`;

    const groupFertilizers = (fertilizers = []) => Object.values(
      fertilizers.reduce((acc, fert) => {
        const key = `${fert.name || fert.customName}-${fert.dealership}`;
        if (!acc[key]) {
          acc[key] = {
            name: fert.name || fert.customName,
            dealership: fert.dealership,
            bag25kg: 0,
            bag50kg: 0,
          };
        }
        if (fert.bagSize === '25') acc[key].bag25kg += Number(fert.bagCount) || 0;
        if (fert.bagSize === '50') acc[key].bag50kg += Number(fert.bagCount) || 0;
        return acc;
      }, {}),
    );

    if (districtData.isSubmission && districtData.districts) {
      districtData.districts.forEach((dist, dIndex) => {
        content += `\n${dIndex + 1}. District: ${dist.name}`;
        dist.chiefdoms.forEach((chiefdom) => {
          content += `\n  Chiefdom: ${chiefdom.name || chiefdom.customName}`;
          groupFertilizers(chiefdom.fertilizers).forEach((f) => {
            content += `
  - ${f.name}
    Dealership: ${f.dealership}
    25kg Bags: ${f.bag25kg}
    50kg Bags: ${f.bag50kg}`;
          });
        });
      });
    } else {
      districtData.chiefdoms.forEach((chiefdom) => {
        content += `\nChiefdom: ${chiefdom.name || chiefdom.customName}`;
        groupFertilizers(chiefdom.fertilizers).forEach((f) => {
          content += `
  - ${f.name}
    Dealership: ${f.dealership}
    25kg Bags: ${f.bag25kg}
    50kg Bags: ${f.bag50kg}`;
        });
      });
    }

    const win = window.open('', '_blank');
    win.document.write(`
      <html>
        <head><title>${districtData.name}</title></head>
        <body><pre>${content}</pre></body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  if (!isAuthenticated || !district) return null;

  const groupFertilizers = (fertilizers = []) => Object.values(
    fertilizers.reduce((acc, fert) => {
      const key = `${fert.name || fert.customName}-${fert.dealership}`;
      if (!acc[key]) {
        acc[key] = {
          name: fert.name || fert.customName,
          dealership: fert.dealership,
          bag25kg: 0,
          bag50kg: 0,
        };
      }
      if (fert.bagSize === '25') acc[key].bag25kg += Number(fert.bagCount) || 0;
      if (fert.bagSize === '50') acc[key].bag50kg += Number(fert.bagCount) || 0;
      return acc;
    }, {}),
  );

  return (
    <div className="modal-overlay">
      <div className="district-view-modal">
        <div className="modal-header">
          <h2>{district.isSubmission ? 'Submission Details' : 'District Details'}</h2>
          <div className="modal-header-actions">
            {district.isSubmission && (
              <button type="button" className="download-pdf-btn" onClick={() => handleDownloadPDF(district)}>
                📄 Download PDF
              </button>
            )}
            <button type="button" className="close-modal-btn" onClick={onClose}>×</button>
          </div>
        </div>

        <div className="modal-content">
          <h3>{district.name}</h3>

          {(district.isSubmission ? district.districts : [district]).map((dist) => (
            <div key={dist.id} className="district-card">

              {district.isSubmission && (
              <div className="district-header">
                <h4>{dist.name}</h4>
              </div>
              )}

              {dist.chiefdoms.map((chiefdom) => (
                <div key={chiefdom.id} className="chiefdom-card">
                  <h5>{chiefdom.name || chiefdom.customName}</h5>

                  {groupFertilizers(chiefdom.fertilizers).map((fert) => (
                    <div
                      key={`${fert.name}-${fert.dealership}`}
                      className="fertilizer-item"
                    >
                      <div className="fertilizer-main-info">
                        <span className="fertilizer-name">{fert.name}</span>
                        <span className="fertilizer-dealership">
                          Dealer:
                          {' '}
                          {fert.dealership || 'Not specified'}
                        </span>
                      </div>

                      <div className="fertilizer-bag-sizes">
                        {fert.bag25kg > 0 && (
                        <span className="bag-size-info">
                          {fert.bag25kg}
                          {' '}
                          x 25kg bags
                        </span>
                        )}
                        {fert.bag50kg > 0 && (
                        <span className="bag-size-info">
                          {fert.bag50kg}
                          {' '}
                          x 50kg bags
                        </span>
                        )}
                        {fert.bag25kg === 0 && fert.bag50kg === 0 && (
                        <span className="bag-size-info no-bags">
                          No bag quantities specified
                        </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <button type="button" className="primary-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

/* -------------------- PROP TYPES (RESTORED) -------------------- */

const fertilizerShape = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string,
  customName: PropTypes.string,
  dealership: PropTypes.string,
  bagSize: PropTypes.string,
  bagCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

const chiefdomShape = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string,
  customName: PropTypes.string,
  districtName: PropTypes.string,
  fertilizers: PropTypes.arrayOf(PropTypes.shape(fertilizerShape)),
};

const districtShape = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  chiefdoms: PropTypes.arrayOf(PropTypes.shape(chiefdomShape)),
};

DistrictViewModal.propTypes = {
  district: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    isSubmission: PropTypes.bool,
    districts: PropTypes.arrayOf(PropTypes.shape(districtShape)),
    chiefdoms: PropTypes.arrayOf(PropTypes.shape(chiefdomShape)),
    submissionDate: PropTypes.string,
    totals: PropTypes.shape({
      total25: PropTypes.number,
      total50: PropTypes.number,
    }),
  }),
  onClose: PropTypes.func.isRequired,
};

DistrictViewModal.defaultProps = {
  district: null,
};

export default DistrictViewModal;

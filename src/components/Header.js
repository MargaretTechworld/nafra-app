import React from 'react';
import PropTypes from 'prop-types';
import logo from '../img/nafra-logo.png';
import logo2 from '../img/logo3.png';

const Header = ({ organizationName }) => (
  <div className="header-container">
    <div className="header">
      <img className="form-logo" src={logo} alt="Logo" />
      <div className="header-text">
        <h1>National Fertilizer Regulatory Agency</h1>
        <h1>&#40;Nafra&#41;</h1>
        <p>Fertilizer Data Portal &#40;2025&#41; </p>
      </div>
      <img className="form-logo" src={logo2} alt="Logo" />
    </div>
    <div className="form-welcome-message">
      <div className="welcome-login">
        <h1>
          Welcome,
          {' '}
          <span className="organization-name">{organizationName || 'Food Security Resilence Program (FSRP)'}</span>
        </h1>
      </div>
      <p>Please carefully fill out the form below to submit your data.</p>
    </div>
  </div>
);

Header.propTypes = {
  organizationName: PropTypes.string,
};

Header.defaultProps = {
  organizationName: 'Food Security Resilence Program (FSRP)',
};

export default Header;

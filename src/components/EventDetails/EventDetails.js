import React, { Component, PropTypes } from 'react';
import moment from 'moment';
import { DateBlock, Loading, SocialBtns } from '../';
import { eventsAPI } from '../../api';
import styles from './EventDetails.sass';

const renderAddress = (location) => {
  const { address_lines: addressLines, locality, region, postal_code: postalCode } = location;
  // Will have to see how this data structure holds up over different events
  return (
    <div className={styles.info}>
      <div className={styles.infoLabel}>Location</div>
      { addressLines[0] && <div>{addressLines[0]}</div> }
      <div>{locality} {region}, {postalCode}</div>
    </div>
  );
};

const renderTimeRange = (startDate, endDate) => {
  // TDB how to properly format this - would be nice to avoid bringing in moment.js
  const startTime = (new Date(startDate)).toLocaleTimeString();
  const endTime = (new Date(endDate)).toLocaleTimeString();
  const dateString = moment(startDate).format('ddd, MMMM DD, YYYY');

  return (
    <div className={styles.info}>
      <div className={styles.infoLabel}>Date & Time</div>
      <div>{dateString}</div>
      <div>{startTime} {endDate ? `- ${endTime}` : ''}</div>
    </div>
  );
};

class EventDetails extends Component {
  constructor() {
    super();

    this.state = {
      isFetchingEvent: true,
      event: null,
      socialPopupOpen: false
    };

    this.toggleSocialPopup = this.toggleSocialPopup.bind(this);
    this._handleDocumentClick = this.handleDocumentClick.bind(this);
  }

  componentDidMount() {
    const { eventId } = this.props.match.params;
    window.addEventListener('click', this._handleDocumentClick);

    this.setState({ isFetchingEvent: true });

    eventsAPI.getEventById(eventId)
      .then(event => {
        this.setState({ event, isFetchingEvent: false });
      })
      .catch(err => {
        console.error(err);
        this.setState({ isFetchingEvent: false });
      });
  }

  componentWillUnmount() {
    window.removeEventListener('click', this._handleDocumentClick);
  }

  // Close socialPopupOpen if clicking on the document (outside of the socialPopupOpen)
  handleDocumentClick() {
    this.setState({ socialPopupOpen: false });
  }

  toggleSocialPopup(e) {
    e.stopPropagation();
    this.setState({ socialPopupOpen: !this.state.socialPopupOpen });
  }

  render() {
    const { event, isFetchingEvent, socialPopupOpen } = this.state;

    // Depending on snappiness of server, may not need to display loading
    if (isFetchingEvent) {
      return <div className={styles.loadingWrapper}><Loading /></div>;
    } else if (!event) {
      return <div className={styles.noDataMsg}>No event data</div>;
    }

    const {
      title,
      start_date: startDate,
      end_date: endDate,
      share_url: shareUrl,
      browser_url: browserUrl,
      featured_image_url: featuredImageUrl,
      description,
      location
    } = event;

    /* eslint-disable jsx-a11y/no-static-element-interactions */
    return (
      <div>
        <div className={styles.titleWrapper}>
          <DateBlock date={startDate} />
          <h1>{title}</h1>
          { location && location.locality &&
            <div className={styles.location}>{location.locality}, {location.region}</div>
          }
        </div>
        <div className={styles.content}>
          <div className={styles.left}>
            <img src={featuredImageUrl || 'http://www.fillmurray.com/950/500'} alt="featured event" />
          </div>

          <div className={styles.right}>
            <div className={styles.infoLinks}>
              <div className={styles.eventLink}>
                <a
                  href={browserUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.eventBtn}
                >
                  <span>
                    FACEBOOK&nbsp;
                  </span>
                  EVENT PAGE
                </a>
              </div>
              <div className={styles.sharing}>
                <div
                  className={styles.shareBtnMobile}
                  onClick={this.toggleSocialPopup}
                  role="link"
                >
                  SHARE
                  <div
                    className={styles.popoverWrapper}
                    style={{ visibility: socialPopupOpen ? 'visible' : 'hidden' }}
                  >
                    <SocialBtns
                      fbLink={shareUrl}
                      twitterLink={shareUrl}
                      iconSize={25}
                    />
                  </div>
                </div>
                <div>
                  <div className={styles.desktopSharing}>
                    <SocialBtns
                      fbLink={shareUrl}
                      twitterLink={shareUrl}
                      iconSize={25}
                    />
                  </div>
                </div>
              </div>
              <div className={styles.locationAndDate}>
                {location && renderAddress(location)}
                {startDate && renderTimeRange(startDate, endDate)}
              </div>
            </div>
          </div>

          <div className={styles.description}>
            <p>
              {description}
            </p>
          </div>
        </div>
      </div>
    );
    /* eslint-enable jsx-a11y/no-static-element-interactions */
  }
}

EventDetails.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      eventId: PropTypes.string
    })
  }).isRequired
};

export default EventDetails;

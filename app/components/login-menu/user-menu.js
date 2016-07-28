import React, { Component, PropTypes } from "react";
import { observer } from "mobx-react";

import Spinner from "../../assets/icons/spinner";
import styles from "./user-menu.css";

@observer
class UserMenu extends Component {
  static contextTypes = {
    store: React.PropTypes.object
  };

  static propTypes = {
    user: PropTypes.object.isRequired,
    domain: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      userFlyoutVisible: false
    };
  }

  onOpenFlyout = () => {
    this.setState({ userFlyoutVisible: true });
  }

  onCloseFlyout = () => {
    this.setState({ userFlyoutVisible: false });
  }

  onClickSignOut = (ev) => {
    ev.preventDefault();

    this.context.store.api.signOut();
  }

  renderFlyout(visible) {
    const { user } = this.props;

    if (!visible) {
      return;
    }
    return (
      <div className={styles.flyout}>
        <button className={styles.flyoutBtnClose} onClick={this.onCloseFlyout}>
          <i className={"icon ion-android-close"}></i>
        </button>
        <p className={styles.userName}>{user.username}</p>
        <button className={styles.signOut} onClick={this.onClickSignOut}>
          Sign out
        </button>

        <div className={styles.presentations}>
          <p className={styles.presentationsHeading}>
            <span className={styles.fancy}>Your Presentations</span>
          </p>
          <Spinner className={styles.spinner} />
          <ul className={styles.list}>
            <li className={styles.listItem}>Presentation name 1</li>
            <li className={styles.listItem}>Presentation name 2</li>
          </ul>
        </div>
      </div>
    );
  }

  render() {
    const { user } = this.props;
    const { userFlyoutVisible } = this.state;

    return (
      <div className={styles.userMenu}>
        <div className={styles.userSubMenu}>
          <p className={styles.userName}>{user.username}</p>
        </div>
        <button className={styles.flyoutBtn} onClick={this.onOpenFlyout}>
          <img className={styles.userAvatar} alt="" src={user.avatar_url} />
          <i className={`${styles.flyoutBtnIcon} icon ion-ios-arrow-down`} ></i>
        </button>
        {this.renderFlyout(userFlyoutVisible)}
      </div>
    );
  }
}

export default UserMenu;

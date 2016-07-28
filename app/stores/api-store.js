import { observable, asReference } from "mobx";
import { remote } from "electron";
import moment from "moment";

const defaultDomain = "https://api.plot.ly";

const normalizeDomain = (domain) => {
  // Remove trailing slash
  if (domain.slice(-1) === "/") {
    /* eslint-disable  no-param-reassign */
    domain = domain.slice(0, domain.length - 1);
    /* eslint-enable  no-param-reassign */
  }

  if (domain.indexOf("http://") === 0 || domain.indexOf("https://") === 0) {
    return domain;
  }

  return `http://${domain}`;
};

export default class ApiStore {
  @observable domainUrl = defaultDomain;
  @observable user = null;
  @observable csrfToken = null;
  @observable presInfo = asReference({});
  @observable fid = null;

  constructor() {
    const userString = localStorage.getItem("user");
    const csrfToken = localStorage.getItem("csrfToken");

    if (userString && csrfToken) {
      this.user = JSON.parse(userString);
      this.csrfToken = csrfToken;
    }
  }

  setDomainUrl(domainUrl) {
    this.domainUrl = normalizeDomain(domainUrl);
  }

  resetDomainUrl() {
    this.domainUrl = defaultDomain;
  }

  setUser(userInfo) {
    // Change relative urls to absolute
    if (userInfo.avatar_url && userInfo.avatar_url.indexOf("/") === 0) {
      /* eslint-disable  no-param-reassign */
      userInfo.avatar_url = `${this.domainUrl}${userInfo.avatar_url}`;
      /* eslint-enable  no-param-reassign */
    }

    localStorage.setItem("user", JSON.stringify(userInfo));
    localStorage.setItem("csrfToken", userInfo.csrf_token);

    this.csrfToken = userInfo.csrf_token;
    this.user = userInfo;
  }

  signOut() {
    remote.getCurrentWindow().webContents.session.clearStorageData(() => {});
    localStorage.removeItem("user");
    localStorage.removeItem("csrfToken");

    this.user = null;
    this.csrfToken = null;
  }

  setPresentation(presObject) {
    this.presInfo = {
      // presObject.date_modified does not change when updating content
      dateModified: moment(new Date()),
      owner: presObject.owner,
      fileName: presObject.filename,
      webUrl: presObject.web_url,
      worldReadable: presObject.world_readable,
      shareKey: presObject.share_key,
      shareKeyEnabled: presObject.share_key_enabled
    };

    this.fid = presObject.fid;
  }
}

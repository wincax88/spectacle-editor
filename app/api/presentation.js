export const create = (domain, csrfToken, presJSON, isPublic, fileName) =>
  fetch(`${domain}/v2/spectacle-presentations`, {
    method: "post",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Plotly-Client-Platform": "Python 0.2",
      "X-CSRFToken": csrfToken
    },
    body: JSON.stringify({
      world_readable: isPublic,
      filename: fileName || "Untitled",
      content: JSON.stringify({
        presentation: presJSON
      })
    })
  })
  .then((response) => response.json());


export const patch = (domain, fid, csrfToken, patchJSON) =>
  fetch(`${domain}/v2/spectacle-presentations/${fid}`, {
    method: "patch",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Plotly-Client-Platform": "Python 0.2",
      "X-CSRFToken": csrfToken
    },
    body: JSON.stringify({
      content: JSON.stringify({
        presentation: patchJSON
      })
    })
  })
  .then((response) => response.json());

export const fetchOne = (domain, fid, csrfToken) =>
  fetch(`${domain}/v2/spectacle-presentations/${fid}`, {
    method: "get",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Plotly-Client-Platform": "Python 0.2",
      "X-CSRFToken": csrfToken
    }
  })
  .then((response) => response.json());

export const fetchAll = (domain, csrfToken) =>
  fetch(`${domain}/v2/spectacle-presentations/`, {
    method: "get",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Plotly-Client-Platform": "Python 0.2",
      "X-CSRFToken": csrfToken
    }
  })
  .then((response) => response.json());

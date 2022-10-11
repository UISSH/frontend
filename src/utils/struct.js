import {USER_INFO} from "src/utils/mutation-types";

export const TERMINAL_SNIPPET_PREFIX = "terminal_snippet_"

export function listResStruct() {
  return {
    code: 200, msg: "success", pagination: {
      total_pages: 1, current_page: 1, count: 0, next: "", previous: null, loading: false,
    }, results: [],
  };
}

export function userInfo() {
  let data = {
    token: null, username: null, email: null,
  };
  let item = window.sessionStorage.getItem(USER_INFO, null);
  if (item != null) {
    data = JSON.parse(item);
  }

  return data;
}

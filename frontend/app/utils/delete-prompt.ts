export async function deletePrompt(
  promptId: string,
  API: string,
  token: string,
  refresh?: () => Promise<void>,
  resetFormCP?: () => void,
) {
  await $fetch(`${API}/api/prompts/${promptId}`, {
    method: "DELETE",
    headers: {
      Authorization: `${token}`,
    },
    async onResponse({ response }) {
      if (response.status == 200) {
        if (refresh) await refresh();
        if (resetFormCP) resetFormCP();
      }
    },
  });
}

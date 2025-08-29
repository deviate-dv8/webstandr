import type { Website } from "~/types/websites";
export default async function verifyUrl(
  url: string,
  token: string,
  refUnique: Ref<boolean | null>,
  API: string,
) {
  try {
    const result = await $fetch<{ data: Website[] }>(`${API}/api/websites`, {
      method: "GET",
      headers: {
        Authorization: `${token}`,
      },
      params: {
        searchBy: "url",
        search: url,
      },
    });
    if (result.data.length == 0) {
      refUnique.value = true;
    } else {
      refUnique.value = false;
    }
    return true;
  } catch {
    refUnique.value = null;
    return false;
  }
}

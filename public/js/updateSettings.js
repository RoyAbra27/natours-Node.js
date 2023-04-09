/* eslint-disable*/
import { showAlert } from './alerts';

// type is profile/password
export const updateData = async (data, type) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/users/update-my-${type}`,
      data,
    });
    if (res.data.status === 'success') {
      showAlert(
        'success',
        `${type[0].toUpperCase() + type.slice(1)} updated successfully!`
      );
      location.reload(true);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};

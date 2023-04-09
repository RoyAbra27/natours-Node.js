/*eslint-disable */
import { showAlert } from './alerts';

const stripe = Stripe(
  'pk_test_51Mt761BIY599TDnaGhOcLDYa0yALsq91eFBWyyC9NpccPLllCBCxdLyAhjzm5Cr0zIexc7cSJEpEXegleGXSxSCX00u8Ml1xPm'
);
export const bookTour = async (tourId) => {
  try {
    const session = await axios(
      `http://localhost:3000/api/v1/booking/checkout-session/${tourId}`
    );
    location.assign(session.data.url);
  } catch (error) {
    console.log(error.response.data);
    showAlert('error', error);
  }
};

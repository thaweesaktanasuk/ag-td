import { FunctionFailure, log } from "@restackio/ai/function";


export type IdVerificationInput = {
  type: "id" | "passport" | "driverLicense";
  documentNumber: string;
};

export type IdVerificationOutput = {
  status: "approved" | "declined";
  data: any
};

export const idVerification = async ({
  type,
  documentNumber,
}: IdVerificationInput): Promise<IdVerificationOutput> => {
  try {
    log.info("idVerification input:", {input: {type, documentNumber}});

    // Simulate status response
    const statuses: IdVerificationOutput['status'][] = ['approved', 'declined'];
    const randomStatusIndex = Math.floor(Math.random() * statuses.length);
    const status = statuses[randomStatusIndex];

    const output: IdVerificationOutput = {
      status,
      data: {
        birthday: {
          status: "ORIGINAL",
          original: "1997-05-23"
        },
        firstname: {
          status: "MATCH",
          value: "ERIKA",
          original: "ERIKA"
        },
        address: {
          zipcode: {
            status: "ORIGINAL",
            original: "W1U"
          },
          country: {
            status: "ORIGINAL",
            original: "DE"
          }
        },
        birthplace: {
          status: "ORIGINAL",
          original: "LONDON"
        },
        nationality: {
          status: "ORIGINAL",
          original: "DE"
        },
        gender: {
          status: "ORIGINAL",
          original: "FEMALE"
        },
        identlanguage: {
          status: "ORIGINAL",
          original: "en"
        },
        lastname: {
          status: "MATCH",
          value: "MUSTERMAN",
          original: "MUSTERMAN"
        }
      }
    };

    log.info(`idVerification output: ${output}`);
    return output;
  } catch (error) {
    throw FunctionFailure.nonRetryable(`Error IdVerificationInput chat: ${error}`);
  }
};

import { db } from "@/lib/db";

import getSession from "../../actions/getSession";
import { getCurrentUser } from "../../actions/get-current-user";

export const getUsers = async () => {
  const session = await getSession();

  if (!session?.user?.email) {
    return null;
  }

  try {

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return null;
    }

    const interests = currentUser?.interestedIn;

    const sameInterestUsers = await db.user.findMany({
      where: {
        role: "MENTEE",
        interestedIn: {
          hasSome: interests
        },
        NOT: { id: currentUser?.id },
      },
      select: { id: true, email: true, name: true, },
    });

    if (!sameInterestUsers) {
      return null;
    }

    return sameInterestUsers;
  } catch (error) {
    // console.log(error);
    return null;
  }
};



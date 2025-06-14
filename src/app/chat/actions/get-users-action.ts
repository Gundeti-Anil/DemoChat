'use server'

import { db } from "@/lib/db";
import { createServerAction } from "zsa";
import { z } from "zod";
import getSession from "../../actions/getSession";
import { getCurrentUser } from "../../actions/get-current-user";
// import { UserRole } from '@/app/schemas/user.schema';

const getUsersInput = z.object({});

export const getUsers = createServerAction()
    .input(getUsersInput)
    .handler(async () => {
        const session = await getSession();

        if (!session?.user?.email) {
            return null;
        }

        try {
            const currentUser = await getCurrentUser();

            if (!currentUser) {
                return null;
            }

            const interests = currentUser?.interestedIn || [];

            const sameInterestUsers = await db.user.findMany({
                where: {
                    role: "MENTEE",
                    interestedIn: {
                        hasSome: interests
                    },
                    NOT: { id: currentUser?.id },
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    image: true
                },
            });

            if (!sameInterestUsers) {
                return null;
            }

            return sameInterestUsers;
        } catch (error) {
            console.error("Error in getUsers action:", error);
            return null;
        }
    });
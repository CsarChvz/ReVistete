import React from "react";
import { getMembers } from "../actions/memberActions";
//import MemberCard from "./MemberCard";
import { fetchCurrentUserLikeIds } from "../actions/likeActions";
import PaginationComponent from "@/components/PaginationComponent";
import { GetMemberParams } from "@/types";
import EmptyState from "@/components/EmptyState";
import { getAvailableClothes } from "../actions/clothesActions";

export default async function MembersPage({
  searchParams,
}: {
  searchParams: GetMemberParams;
}) {
  const clothes =
    await getAvailableClothes();

    console.log(clothes)
  return (
    <>
        a
    </>
  );
}

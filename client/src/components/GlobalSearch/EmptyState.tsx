import React from "react";
import { connectHits } from "react-instantsearch-dom";

const EmptyState = ({ hits }: any) => {
  return (
    <>
      {hits?.length == 0 ? (
        <div className="p-8">
          <p className="text-center text-base text-body">No items found...</p>
        </div>
      ) : null}
    </>
  );
};

export default connectHits(EmptyState);

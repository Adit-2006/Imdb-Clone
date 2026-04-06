import React from "react";

function Pagination({ decrementPage, incrementPage, pageNo }) {

    return(
        <div className="mt-8 bg-gray-400 h-12 flex justify-center items-center">
            <div>
                <i
                  onClick={decrementPage}
                  className="fa-solid fa-arrow-left cursor-pointer"
                ></i>
            </div>
            <div>{pageNo}</div>
            <div>
                <i
                  onClick={incrementPage}
                  className="fa-solid fa-arrow-right cursor-pointer"
                ></i>
            </div>
        </div>
    )
}

export default Pagination
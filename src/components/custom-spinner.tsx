import { RotatingSquare } from "react-loader-spinner";

export function CustomSpinner() {
    return (
        <RotatingSquare
            visible={true}
            height="100"
            width="100"
            color="#1447e6"
            ariaLabel="rotating-square-loading"
            wrapperStyle={{}}
            wrapperClass=""
        />
    );
}

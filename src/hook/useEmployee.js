import { useContext } from "react"
import { EmployeeContext } from "../contexts/EmployeeContext"


export const useEmployee = () => {
    const context = useContext(EmployeeContext);
    if(!context) {
        throw new Error('useEmployee must be used within an EmployeeProvider');

    }
    return context;
}
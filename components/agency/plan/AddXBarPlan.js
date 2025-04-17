import Apis from '@/components/apis/Apis';
import { Modal, Box, Switch, CircularProgress } from '@mui/material';
import { useState } from 'react';
import { AuthToken } from './AuthDetails';
import axios from 'axios';
// import { AiOutlineInfoCircle } from 'react-icons/ai';

export default function AddXBarPlan({ open, handleClose, onPlanCreated }) {

    const [title, setTitle] = useState("");
    const [tag, setTag] = useState("");
    const [planDescription, setPlanDescription] = useState("");
    const [originalPrice, setOriginalPrice] = useState("");
    const [discountedPrice, setDiscountedPrice] = useState("");
    const [minutes, setMinutes] = useState("");
    const [addPlanLoader, setAddPlanLoader] = useState(false);

    //code to add plan
    const handleAddPlanClick = async () => {
        try {
            setAddPlanLoader(true);
            console.log("Working");

            const ApiPath = Apis.addXBarOptions;
            const Token = AuthToken();

            const formData = new FormData();
            formData.append("title", title);
            formData.append("tag", tag);
            formData.append("planDescription", planDescription);
            formData.append("originalPrice", originalPrice);
            formData.append("discountedPrice", discountedPrice);
            formData.append("percentageDiscount", discountedPrice / originalPrice * 100);
            formData.append("minutes", minutes);

            const response = await axios.post(ApiPath, formData, {
                headers: {
                    "Authorization": "Bearer " + Token
                }
            });

            if (response) {
                console.log("Response of add xbars api is", response.data);
                setAddPlanLoader(false);
                onPlanCreated(response);
                if(response.data.status === true){
                    handleClose();
                }
            }

        } catch (error) {
            setAddPlanLoader(false);
            console.error("Error is", error);
        } finally {
            setAddPlanLoader(false);
        }
    }

    const styles = {
        labels: {
            fontSize: "15px",
            fontWeight: "500",
            color: "#00000050",
        },
        inputs: {
            fontSize: "15px",
            fontWeight: "500",
            color: "#000000",
        }
    }

    return (
        <Modal open={open} onClose={handleClose}>
            {/*<Box className="bg-white rounded-xl p-6 max-w-md w-[95%] mx-auto mt-20 shadow-lg">*/}
            <Box
                className="bg-white rounded-xl p-6 max-w-md w-[95%] max-h-[90vh] border-none overflow-y-auto shadow-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scrollbar-hide"
                sx={{
                    '&::-webkit-scrollbar': { display: 'none' },
                    scrollbarWidth: 'none',       // Firefox
                    msOverflowStyle: 'none'       // IE/Edge
                }}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">New XBar Option</h2>
                    <button onClick={handleClose} className="text-gray-400 hover:text-black">✕</button>
                </div>

                {/* Plan Name */}
                <label style={styles.labels}>Plan Name</label>
                <input
                    style={styles.inputs}
                    className="w-full border border-gray-200 rounded p-2 mb-4 mt-1 outline-none focus:outline-none focus:ring-0 focus:border-gray-200"
                    placeholder="Type here"
                    value={title}
                    onChange={(e) => { setTitle(e.target.value) }}
                />

                {/* Tag Option */}
                <label style={styles.labels}>Tag Option</label>
                <input
                    style={styles.inputs}
                    className="w-full border border-gray-200 outline-none focus:outline-none focus:ring-0 focus:border-gray-200 rounded p-2 mb-4 mt-1" placeholder="Popular, best deals"
                    value={tag}
                    onChange={(e) => { setTag(e.target.value) }}
                />

                {/* Description */}
                <label style={styles.labels}>Description</label>
                <input
                    style={styles.inputs}
                    className="w-full border border-gray-200 outline-none focus:outline-none focus:ring-0 focus:border-gray-200 rounded p-2 mb-4 mt-1" placeholder="Type here"
                    value={planDescription}
                    onChange={(e) => { setPlanDescription(e.target.value) }}
                />

                {/* Price */}
                <label style={styles.labels}>Price</label>
                <input
                    style={styles.inputs}
                    type="number"
                    className="w-full border border-gray-200 outline-none focus:outline-none focus:ring-0 focus:border-gray-200 rounded p-2 mb-4 mt-1" placeholder="00"
                    value={originalPrice}
                    onChange={(e) => { setOriginalPrice(e.target.value) }}
                />
                <p className="flex items-center gap-1 mb-4" style={{ fontSize: "15px", fontWeight: "500" }}>
                    {/*<AiOutlineInfoCircle className="text-sm" />*/}
                    Min cost per min is 20 cents
                </p>

                {/* Strikethrough Price */}
                <label style={styles.labels}>Strikethrough Price (Optional)</label>
                <input
                    style={styles.inputs}
                    type="number"
                    className="w-full border border-gray-200 outline-none focus:outline-none focus:ring-0 focus:border-gray-200 rounded p-2 mb-4 mt-1" placeholder="00"
                    value={discountedPrice}
                    onChange={(e) => { setDiscountedPrice(e.target.value) }}
                />

                {/* Minutes */}
                <label style={styles.labels}>Minutes</label>
                <input
                    style={styles.inputs}
                    type="number"
                    className="w-full border border-gray-200 outline-none focus:outline-none focus:ring-0 focus:border-gray-200 rounded p-2 mb-4 mt-1" placeholder="000"
                    value={minutes}
                    onChange={(e) => { setMinutes(e.target.value) }}
                />

                {/* Action Buttons */}
                <div className="flex justify-between mt-6">
                    <button onClick={handleClose} className="text-purple-600 font-semibold">Cancel</button>
                    {
                        addPlanLoader ?
                            <CircularProgress size={30} /> :
                            <button
                                className="bg-purple w-[12vw] hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg"
                                onClick={handleAddPlanClick}
                            >
                                Create Plan
                            </button>
                    }
                </div>
            </Box>
        </Modal>
    );
}

import { Router } from "express";
const router = Router();
import { createReferralRequest, getAllReferral, referralUpload, referralEdit, referralDeliveryEdit, referralRejectCancelEdit, getClinicList, generatePDFCloudinaryArray } from '../controllers/referralController.js';
import upload from '../middleware/multerMiddleware.js';


router.post('/create',upload.fields([{ name: 'patientCard', maxCount: 1 }, { name: 'patientPrescription', maxCount: 1 }]), createReferralRequest);
router.get('/getList', getAllReferral);
router.patch('/upload', upload.single('patientReferral'), referralUpload)
router.patch('/edit', upload.fields([{ name: 'patientCard', maxCount: 1 }, { name: 'patientPrescription', maxCount: 1 }, { name: 'patientReferral', maxCount: 1 }]), referralEdit)
router.patch('/delivery/edit', referralDeliveryEdit)
router.patch('/reject/edit', referralRejectCancelEdit)
router.get('/getClinicList/:location', getClinicList);
router.post('/generatePDF', generatePDFCloudinaryArray)



export default router;
import { Router } from "express";
const router = Router();
import { createDispensaryRequest, getDispensaryList, updateDispensaryList} from '../controllers/dispensaryController.js';



router.post('/create', createDispensaryRequest);
router.get('/getList', getDispensaryList);
// router.patch('/upload', upload.single('patientReferral'), referralUpload)
// router.patch('/edit', upload.fields([{ name: 'patientCard', maxCount: 1 }, { name: 'patientPrescription', maxCount: 1 }, { name: 'patientReferral', maxCount: 1 }]), referralEdit)
router.patch('/edit', updateDispensaryList)
// router.patch('/reject/edit', referralRejectCancelEdit)


export default router;
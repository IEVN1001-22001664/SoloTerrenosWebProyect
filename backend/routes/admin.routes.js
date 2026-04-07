const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/roleMiddleware');

/* ===========================
   USUARIOS
=========================== */

router.get('/users', authMiddleware, roleMiddleware('admin'), adminController.getUsers);
router.put('/users/:id/role', authMiddleware, roleMiddleware('admin'), adminController.updateUserRole);
router.put('/users/:id/subscription', authMiddleware, roleMiddleware('admin'), adminController.toggleSubscription);
router.delete('/users/:id', authMiddleware, roleMiddleware('admin'), adminController.deleteUser);
router.get("/colaboradores",authMiddleware,roleMiddleware("admin"),adminController.getColaboradores);
router.put('/usuarios/:id/auto-aprobado', authMiddleware, roleMiddleware('admin'), adminController.updateAutoAprobado);

router.put(
  '/colaboradores/:id/limite',
  authMiddleware,
  roleMiddleware('admin'),
  adminController.updateColaboradorLimite
);

router.get(
  '/dashboard',
  authMiddleware,
  roleMiddleware('admin'),
  adminController.getDashboardStats
);

router.get(
  '/publicaciones',
  authMiddleware,
  roleMiddleware('admin'),
  adminController.getPublicaciones
);

router.patch(
  '/publicaciones/:id/estado',
  authMiddleware,
  roleMiddleware('admin'),
  adminController.cambiarEstadoPublicacion
);

router.delete(
  "/publicaciones/:id",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.eliminarPublicacion
);

router.get(
  "/publicaciones/borrados",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.obtenerPublicacionesBorradas
);

router.put(
  "/publicaciones/:id/restaurar",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.restaurarPublicacion
);

router.delete(
  "/publicaciones/:id/definitivo",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.eliminarDefinitivamente
);

module.exports = router;
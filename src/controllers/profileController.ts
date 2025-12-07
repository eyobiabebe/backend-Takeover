import { Request, Response } from 'express';
import { UserProfile } from '../models/UserProfile';
import { User } from '../models/User';
import { uploadProfileToCloudinary } from '../utils/uploadProfileToCloudinary';

export const getOrCreateProfile = async (req: Request, res: Response) => {
    const userId = req.body.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        let profile = await UserProfile.findOne({ where: { userId: userId } });

        if (!profile) {
            profile = await UserProfile.create({ userId: userId });
        }

        const profile_image = await User.findOne({ where: { id: userId }, attributes: ['name', 'email','image'] });

        res.json({ profile, profile_image });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch or create profile', details: err });
    }
};
export const userProfile = async (req: Request, res: Response) => {
    const userId = req.body.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const profile = await UserProfile.findOne({ where: { userId: userId } });
        const user = await User.findOne({ where: { id: userId } });

        res.json({ profile, user });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch or create profile', details: err });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    const userId = req.body.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const profile = await UserProfile.findOne({ where: { userId: userId } });
        if (!profile) return res.status(404).json({ error: 'Profile not found' });

        // Update fields
        const updated = await profile.update(req.body.data);

        // Optional: check if it's "complete"
        const requiredFields = [
            'phoneNumber',
            'dateOfBirth',
            'employmentStatus',
            'currentAddress',
            'emergencyContact',
        ];

        const isComplete = requiredFields.every(
            (field) => !!(updated as any)[field]
        );

        if (isComplete && !updated.isCompleted) {
            await updated.update({ isCompleted: true });
        }

        res.status(200).json(updated);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update profile', details: err });
    }
};

export const uploadProfileImage = async (req: Request, res: Response) => {
    const userId = req.body.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const profile = await User.findOne({ where: { id: userId } });
        if (!profile) return res.status(404).json({ error: 'Profile not found' });

        // Handle file upload
        const file = req.file;
        if (!file) return res.status(400).json({ error: 'No file uploaded' });

        const imageUrl = await uploadProfileToCloudinary(file.buffer);

        // Save file path to profile
        profile.image = imageUrl;
        await profile.save();

        res.status(200).json(profile);
    } catch (err) {
        res.status(500).json({ error: 'Failed to upload profile image', details: err });
    }
};

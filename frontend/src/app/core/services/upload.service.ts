import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable, Observer } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class UploadService {

    constructor(private http: HttpClient) { }

    /**
     * Giả lập upload file lên server kèm theo tiến độ (progress)
     * Thay vì gọi API thật, ta dùng Observable thuần túy để emit mock events.
     * Khi backend sẵn sàng, thay nội dung trong hàm này bằng:
     * return this.http.post('YOUR_API_ENDPOINT', formData, { reportProgress: true, observe: 'events' });
     */
    uploadMock(file: File): Observable<HttpEvent<any>> {
        return new Observable((observer: Observer<HttpEvent<any>>) => {
            let progress = 0;

            const intervalId = setInterval(() => {
                progress += Math.floor(Math.random() * 20) + 10; // Tăng ngẫu nhiên 10-30%
                if (progress > 100) progress = 100;

                observer.next({
                    type: HttpEventType.UploadProgress,
                    loaded: progress,
                    total: 100
                });

                if (progress === 100) {
                    clearInterval(intervalId);
                    setTimeout(() => {
                        observer.next(new HttpResponse({ status: 200, body: { message: 'Upload success', fileName: file.name } }));
                        observer.complete();
                    }, 500); // Đợi 1 chút trước khi response OK
                }
            }, 300); // Cập nhật mỗi 300ms

            return () => {
                clearInterval(intervalId); // Hỗ trợ cancel upload
            };
        });
    }

}
